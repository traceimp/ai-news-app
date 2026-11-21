"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { MissingApiKeyError } from "@/lib/ai/client";
import { processPendingArticles, type ProcessResult } from "@/lib/ai/process-batch";
import { deleteArticle } from "@/db/queries";
import { collectNews, type CollectResult } from "@/lib/rss/collect";

export type FetchNewsResult =
  | ({ ok: true; aiError?: string } & CollectResult & ProcessResult)
  | { ok: false; message: string };

// Server Action은 직접 POST로도 호출될 수 있으므로 여기서 로그인 여부를 확인한다.
export async function fetchNewsAction(): Promise<FetchNewsResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "로그인이 필요해요." };

  try {
    const collected = await collectNews(userId);
    // 모든 소스가 실패했으면 오류로 알린다.
    if (collected.failedSources.length > 0 && collected.added + collected.skipped === 0) {
      return { ok: false, message: "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요." };
    }

    // 수집은 이미 저장됐으므로, 번역 단계가 통째로 실패해도 수집 결과는 보여준다.
    let processed: ProcessResult = { translated: 0, failed: 0 };
    let aiError: string | undefined;
    try {
      processed = await processPendingArticles(userId);
    } catch (error) {
      aiError =
        error instanceof MissingApiKeyError
          ? "ANTHROPIC_API_KEY가 설정되지 않아 번역을 건너뛰었어요."
          : "번역 중 문제가 생겼어요. 다시 시도하면 이어서 처리해요.";
      console.error("processPendingArticles failed", error);
    }

    revalidatePath("/dashboard");
    return { ok: true, ...collected, ...processed, aiError };
  } catch (error) {
    console.error("fetchNewsAction failed", error);
    return { ok: false, message: "뉴스를 저장하는 중 문제가 생겼어요. 다시 시도해 주세요." };
  }
}

// status는 HTTP 응답이 아니라 오류 종류를 나타내는 상태 코드다. (Server Action은 HTTP 응답을 직접 만들 수 없다.)
export type DeleteArticleResult =
  | { ok: true }
  | { ok: false; status: 400 | 401 | 404 | 500; message: string };

// 로그인과 소유권(userId)을 서버에서 확인한 뒤 기사를 DB에서 삭제한다.
export async function deleteArticleAction(articleId: number): Promise<DeleteArticleResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, status: 401, message: "로그인이 필요해요." };
  if (!Number.isInteger(articleId)) return { ok: false, status: 400, message: "잘못된 요청이에요." };

  try {
    const deleted = await deleteArticle(userId, articleId);
    if (!deleted) {
      return { ok: false, status: 404, message: "이미 삭제되었거나 찾을 수 없는 기사예요." };
    }
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    console.error("deleteArticleAction failed", error);
    return { ok: false, status: 500, message: "삭제하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
}

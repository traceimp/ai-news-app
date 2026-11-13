"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { MissingApiKeyError } from "@/lib/ai/client";
import { processPendingArticles, type ProcessResult } from "@/lib/ai/process-batch";
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

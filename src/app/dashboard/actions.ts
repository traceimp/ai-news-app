"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { collectNews, type CollectResult } from "@/lib/rss/collect";

export type FetchNewsResult =
  | ({ ok: true } & CollectResult)
  | { ok: false; message: string };

// Server Action은 직접 POST로도 호출될 수 있으므로 여기서 로그인 여부를 확인한다.
export async function fetchNewsAction(): Promise<FetchNewsResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "로그인이 필요해요." };

  try {
    const result = await collectNews(userId);
    // 모든 소스가 실패했으면 오류로 알린다.
    if (result.failedSources.length > 0 && result.added + result.skipped === 0) {
      return { ok: false, message: "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요." };
    }
    revalidatePath("/dashboard");
    return { ok: true, ...result };
  } catch (error) {
    console.error("fetchNewsAction failed", error);
    return { ok: false, message: "뉴스를 저장하는 중 문제가 생겼어요. 다시 시도해 주세요." };
  }
}

import "server-only";
import { insertNewArticles } from "@/db/queries";
import { fetchFeed, type FeedItem } from "./parse";
import { FEED_SOURCES, MAX_ITEMS_PER_FEED, WINDOW_HOURS } from "./sources";

export type CollectResult = {
  added: number; // 새로 저장된 기사
  skipped: number; // 이미 저장되어 있거나 중복이라 건너뛴 기사
  failedSources: string[]; // 가져오기에 실패한 소스 이름
};

// 두 RSS 피드에서 최근 24시간 기사를 가져와 articles에 저장한다.
// 번역·요약·카테고리 분류는 하지 않는다(별도 단계에서 titleKo가 null인 기사를 처리).
export async function collectNews(userId: string): Promise<CollectResult> {
  const cutoff = Date.now() - WINDOW_HOURS * 60 * 60 * 1000;

  const settled = await Promise.allSettled(FEED_SOURCES.map(fetchFeed));

  const failedSources: string[] = [];
  const candidates = new Map<string, FeedItem>(); // originalUrl 기준 중복 제거

  settled.forEach((result, i) => {
    if (result.status === "rejected") {
      failedSources.push(FEED_SOURCES[i].name);
      return;
    }
    const recent = result.value
      .filter((item) => item.publishedAt && item.publishedAt.getTime() >= cutoff)
      .sort((a, b) => b.publishedAt!.getTime() - a.publishedAt!.getTime())
      .slice(0, MAX_ITEMS_PER_FEED);

    for (const item of recent) {
      if (!candidates.has(item.originalUrl)) candidates.set(item.originalUrl, item);
    }
  });

  const items = [...candidates.values()];
  const added = await insertNewArticles(userId, items);

  return { added, skipped: items.length - added, failedSources };
}

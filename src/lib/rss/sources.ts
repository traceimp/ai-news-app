export type FeedSource = {
  name: string; // articles.source 에 저장되는 값
  url: string;
};

export const FEED_SOURCES: FeedSource[] = [
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
];

// 수집 대상 기간(시간)
export const WINDOW_HOURS = 24;
// 피드당 최대 수집 건수 (가져오기 건수 상한)
export const MAX_ITEMS_PER_FEED = 20;
// 피드 요청 타임아웃(ms)
export const FETCH_TIMEOUT_MS = 10_000;

import Parser from "rss-parser";
import { FETCH_TIMEOUT_MS, type FeedSource } from "./sources";

export type FeedItem = {
  source: string;
  originalUrl: string;
  originalTitle: string;
  originalSummary: string | null;
  publishedAt: Date | null;
};

const parser = new Parser();

const MAX_SUMMARY_LENGTH = 2000;

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#8217;": "’",
  "&#8216;": "‘",
  "&#8220;": "“",
  "&#8221;": "”",
  "&nbsp;": " ",
};

// HTML 태그를 제거하고 흔한 엔티티를 풀어 공백을 정리한다.
export function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:amp|lt|gt|quot|nbsp|#39|#8217|#8216|#8220|#8221);/g, (m) => HTML_ENTITIES[m] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

// 중복 판별용 URL 정규화: 추적 파라미터·해시·끝 슬래시 제거, 호스트 소문자.
export function normalizeUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (key.toLowerCase().startsWith("utm_") || ["ref", "fbclid", "gclid"].includes(key.toLowerCase())) {
        url.searchParams.delete(key);
      }
    }
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    return null;
  }
}

// 피드 하나를 가져와 공통 형태로 변환한다. 실패하면 예외를 던진다.
export async function fetchFeed(source: FeedSource): Promise<FeedItem[]> {
  const res = await fetch(source.url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      "User-Agent": "ai-news-collector/0.1",
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${source.name} 피드 응답 오류 (${res.status})`);

  const feed = await parser.parseString(await res.text());

  const items: FeedItem[] = [];
  for (const item of feed.items) {
    const originalUrl = item.link ? normalizeUrl(item.link) : null;
    const originalTitle = item.title ? stripHtml(item.title) : "";
    if (!originalUrl || !originalTitle) continue;

    const rawSummary = item.contentSnippet ?? item.summary ?? item.content ?? "";
    const summary = stripHtml(rawSummary).slice(0, MAX_SUMMARY_LENGTH);

    const date = item.isoDate ? new Date(item.isoDate) : null;

    items.push({
      source: source.name,
      originalUrl,
      originalTitle,
      originalSummary: summary || null,
      publishedAt: date && !Number.isNaN(date.getTime()) ? date : null,
    });
  }
  return items;
}

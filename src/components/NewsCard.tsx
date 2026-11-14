import type { ArticleWithCategory } from "@/db/queries";
import { SaveToNotionButton } from "@/components/SaveToNotionButton";
import { getCategoryColor } from "@/lib/category-colors";

// 발행일을 한국 시간 기준 YYYY.MM.DD로 표시한다.
function formatDate(date: Date) {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}.${get("month")}.${get("day")}`;
}

export function NewsCard({ article }: { article: ArticleWithCategory }) {
  const categoryName = article.categoryName ?? "미분류";
  const badgeClass = getCategoryColor(article.categoryName ? article.categoryColor : null).badge;

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
        >
          {categoryName}
        </span>
        <span className="text-xs text-slate-500 dark:text-neutral-400">
          {article.source}
          {article.publishedAt && ` · ${formatDate(article.publishedAt)}`}
        </span>
      </div>

      <h3 className="break-keep text-base font-semibold leading-snug text-slate-900 sm:text-lg dark:text-neutral-100">
        {article.titleKo ?? article.originalTitle}
      </h3>

      {article.summaryKo ? (
        <p className="line-clamp-3 break-keep text-sm leading-relaxed text-slate-700 dark:text-neutral-300">
          {article.summaryKo}
        </p>
      ) : (
        // 번역은 수집과 분리된 별도 단계에서 채운다.
        <p className="text-sm text-slate-500 dark:text-neutral-400">번역 대기 중</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <a
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-slate-500 underline-offset-4 hover:text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:text-neutral-400"
        >
          원문 보기 ↗
        </a>

        <SaveToNotionButton
          articleId={article.id}
          notionPageUrl={article.notionPageUrl}
          disabled={!article.titleKo || !article.summaryKo}
        />
      </div>
    </article>
  );
}

import type { ArticleWithCategory } from "@/db/queries";
import { DeleteArticleButton } from "@/components/DeleteArticleButton";
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
  const color = getCategoryColor(
    article.categoryName ? article.categoryColor : null,
  );

  return (
    <article className="group relative flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:shadow-black/40">
      <DeleteArticleButton articleId={article.id} />

      {/* 상단 줄: 카테고리 배지 · 출처/날짜 */}
      <div className="flex items-center justify-between gap-3 pr-7">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${color.badge}`}
        >
          <span aria-hidden className={`size-1.5 rounded-full ${color.dot}`} />
          {categoryName}
        </span>
        <span className="truncate text-xs text-slate-500 dark:text-neutral-400">
          <span className="font-medium text-slate-600 dark:text-neutral-300">
            {article.source}
          </span>
          {article.publishedAt && (
            <>
              <span aria-hidden className="mx-1.5">
                ·
              </span>
              <time
                className="tabular-nums"
                dateTime={article.publishedAt.toISOString()}
              >
                {formatDate(article.publishedAt)}
              </time>
            </>
          )}
        </span>
      </div>

      {/* 본문: 제목(가장 강조) → 요약 */}
      <div className="space-y-2.5">
        <h3 className="line-clamp-3 break-keep text-base font-semibold leading-snug tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-indigo-700 sm:text-lg dark:text-neutral-100 dark:group-hover:text-indigo-300">
          {article.titleKo ?? article.originalTitle}
        </h3>

        {article.summaryKo ? (
          <p className="line-clamp-3 break-keep text-sm leading-7 text-slate-600 dark:text-neutral-400">
            {article.summaryKo}
          </p>
        ) : (
          // 번역은 수집과 분리된 별도 단계에서 채운다.
          <p className="text-sm text-slate-500 dark:text-neutral-400">
            번역 대기 중
          </p>
        )}
      </div>

      {/* 하단 줄: 구분선 아래에 원문 보기 · 저장 버튼 */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-4 dark:border-neutral-800">
        <a
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link -mx-1 inline-flex items-center gap-1 rounded px-1 text-sm font-medium text-slate-600 underline-offset-4 transition-colors hover:text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:text-neutral-300 dark:hover:text-indigo-300"
        >
          원문 보기
          <span
            aria-hidden
            className="transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 motion-reduce:transition-none"
          >
            ↗
          </span>
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

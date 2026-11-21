// 뉴스 카드가 로딩되는 동안 보여주는 카드 모양 스켈레톤 (NewsCard 구성과 같은 배치).
export function NewsCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex animate-pulse flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      {/* 상단 줄: 카테고리 배지 · 출처/날짜 */}
      <div className="flex items-center justify-between gap-2">
        <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-neutral-800" />
        <div className="h-4 w-28 rounded bg-slate-200 dark:bg-neutral-800" />
      </div>
      {/* 제목 */}
      <div className="h-5 w-4/5 rounded bg-slate-200 dark:bg-neutral-800" />
      {/* 요약 3줄 */}
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded bg-slate-200 dark:bg-neutral-800" />
        <div className="h-3.5 w-full rounded bg-slate-200 dark:bg-neutral-800" />
        <div className="h-3.5 w-2/3 rounded bg-slate-200 dark:bg-neutral-800" />
      </div>
      {/* 하단 줄: 원문 보기 · 저장 버튼 */}
      <div className="mt-auto flex items-center justify-between pt-2">
        <div className="h-4 w-16 rounded bg-slate-200 dark:bg-neutral-800" />
        <div className="h-8 w-24 rounded-lg bg-slate-200 dark:bg-neutral-800" />
      </div>
    </div>
  );
}

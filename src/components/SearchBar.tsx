import Link from "next/link";

type Props = {
  query: string; // 현재 검색어 (없으면 빈 문자열)
  category?: string; // 현재 카테고리 필터 값 (검색해도 유지)
  clearHref: string; // 검색어만 지우는 주소
};

// 일반 GET 폼이라 '검색' 버튼 클릭과 Enter 키 모두 /dashboard?q=…로 이동한다.
// 검색하면 page는 보내지 않아 1페이지부터 보여준다.
export function SearchBar({ query, category, clearHref }: Props) {
  return (
    <form action="/dashboard" method="get" role="search" className="flex shrink-0 gap-2 lg:w-96">
      {category && <input type="hidden" name="category" value={category} />}
      <input
        type="search"
        name="q"
        key={query} // 주소의 검색어가 바뀌면 입력창도 그 값으로 맞춘다.
        defaultValue={query}
        maxLength={100}
        placeholder="키워드로 뉴스 검색 (제목·요약)"
        aria-label="뉴스 검색어"
        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />
      <button
        type="submit"
        className="shrink-0 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900"
      >
        검색
      </button>
      {query && (
        <Link
          href={clearHref}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          초기화
        </Link>
      )}
    </form>
  );
}

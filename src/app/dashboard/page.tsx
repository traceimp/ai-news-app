import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getArticleCounts, getArticlePage, getCategories } from "@/db/queries";
import { Pagination } from "@/components/Pagination";
import { CategoryBar, type CategoryFilter } from "@/components/CategoryBar";
import { NewsCard } from "@/components/NewsCard";
import { FetchNewsButton } from "@/components/FetchNewsButton";

// 한 페이지에 보여줄 뉴스 카드 수 (3열 그리드에서 3줄)
const PAGE_SIZE = 9;

// 뉴스 가져오기(Server Action)가 수집 + Claude 번역까지 하므로 실행 시간 상한을 늘린다.
export const maxDuration = 300;

export const metadata: Metadata = {
  title: "대시보드 | AI 뉴스 수집기",
};

export default function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <main className="flex-1 bg-slate-50 py-8 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-neutral-100">
              AI 뉴스
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
              해외 AI 뉴스를 한국어로 정리했어요
            </p>
          </div>
          <FetchNewsButton />
        </div>

        {/* 로그인 정보와 DB 조회는 요청 시점에 실행되므로 Suspense 안에서 읽는다. */}
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard">["searchParams"];
}) {
  const { userId } = await auth();
  if (!userId) redirect("/"); // 로그인 화면은 홈에 있다.

  const [categories, counts, params] = await Promise.all([
    getCategories(userId),
    getArticleCounts(userId),
    searchParams,
  ]);

  // ?category= 값 해석: 내 카테고리에 없는 값은 '전체'로 본다.
  const rawCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  let selected: CategoryFilter = "all";
  if (rawCategory === "uncategorized") {
    selected = "uncategorized";
  } else if (rawCategory && categories.some((c) => String(c.id) === rawCategory)) {
    selected = Number(rawCategory);
  }

  // 선택한 필터의 전체 기사 수로 총 페이지 수를 계산한다.
  const filteredTotal =
    selected === "all"
      ? counts.total
      : selected === "uncategorized"
        ? counts.uncategorized
        : (counts.byCategory.get(selected) ?? 0);
  const totalPages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));

  // ?page= 값 해석: 숫자가 아니거나 범위를 벗어나면 가까운 유효한 페이지로 보정한다.
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const requested = Number.parseInt(rawPage ?? "1", 10);
  const page = Math.min(Math.max(Number.isNaN(requested) ? 1 : requested, 1), totalPages);

  const visible = filteredTotal === 0 ? [] : await getArticlePage(userId, selected, page, PAGE_SIZE);

  // 페이지 이동 시 카테고리 필터를 유지한다.
  const hrefFor = (target: number) => {
    const query = new URLSearchParams();
    if (selected !== "all") query.set("category", String(selected));
    if (target > 1) query.set("page", String(target));
    const qs = query.toString();
    return qs ? `/dashboard?${qs}` : "/dashboard";
  };

  return (
    <>
      <CategoryBar categories={categories} counts={counts} selected={selected} />

      {visible.length === 0 ? (
        <p className="py-16 text-center text-slate-500 dark:text-neutral-400">
          {counts.total === 0
            ? "아직 가져온 뉴스가 없어요."
            : "이 카테고리에는 뉴스가 없어요."}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} hrefFor={hrefFor} />
        </>
      )}
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-hidden className="space-y-6">
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

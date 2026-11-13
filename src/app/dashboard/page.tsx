import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getArticles, getCategories } from "@/db/queries";
import { CategoryBar, type CategoryFilter } from "@/components/CategoryBar";
import { NewsCard } from "@/components/NewsCard";

export const metadata: Metadata = {
  title: "대시보드 | AI 뉴스 수집기",
};

export default function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <main className="flex-1 bg-slate-50 py-8 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-neutral-100">
            AI 뉴스
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
            해외 AI 뉴스를 한국어로 정리했어요
          </p>
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

  const [categories, articles, params] = await Promise.all([
    getCategories(userId),
    getArticles(userId),
    searchParams,
  ]);

  // 카테고리별 기사 수
  const byCategory = new Map<number, number>();
  let uncategorized = 0;
  for (const a of articles) {
    if (a.categoryId === null) uncategorized++;
    else byCategory.set(a.categoryId, (byCategory.get(a.categoryId) ?? 0) + 1);
  }

  // ?category= 값 해석: 내 카테고리에 없는 값은 '전체'로 본다.
  const raw = Array.isArray(params.category) ? params.category[0] : params.category;
  let selected: CategoryFilter = "all";
  if (raw === "uncategorized") {
    selected = "uncategorized";
  } else if (raw && categories.some((c) => String(c.id) === raw)) {
    selected = Number(raw);
  }

  const visible = articles.filter((a) =>
    selected === "all"
      ? true
      : selected === "uncategorized"
        ? a.categoryId === null
        : a.categoryId === selected,
  );

  return (
    <>
      <CategoryBar
        categories={categories}
        counts={{ total: articles.length, uncategorized, byCategory }}
        selected={selected}
      />

      {visible.length === 0 ? (
        <p className="py-16 text-center text-slate-500 dark:text-neutral-400">
          {articles.length === 0
            ? "아직 가져온 뉴스가 없어요."
            : "이 카테고리에는 뉴스가 없어요."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
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

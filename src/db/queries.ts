import "server-only";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "./index";
import { articles, categories } from "./schema";

// 모든 쿼리는 Clerk userId로 범위를 제한한다.

export async function getCategories(userId: string) {
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.createdAt), asc(categories.id));
}

export type ArticleFilter = "all" | "uncategorized" | number;

// 카테고리별 기사 수. 카테고리 바의 칩에 표시한다.
export async function getArticleCounts(userId: string) {
  const rows = await db
    .select({ categoryId: articles.categoryId, count: sql<number>`count(*)::int` })
    .from(articles)
    .where(eq(articles.userId, userId))
    .groupBy(articles.categoryId);

  const byCategory = new Map<number, number>();
  let uncategorized = 0;
  let total = 0;
  for (const row of rows) {
    total += row.count;
    if (row.categoryId === null) uncategorized = row.count;
    else byCategory.set(row.categoryId, row.count);
  }
  return { total, uncategorized, byCategory };
}

// 최신 발행일순. 발행일이 없는 기사는 맨 뒤로 보내고, 같으면 수집 순서의 역순.
// 페이지 경계가 흔들리지 않도록 마지막에 id로 순서를 확정한다.
export async function getArticlePage(
  userId: string,
  filter: ArticleFilter,
  page: number,
  pageSize: number,
) {
  const where =
    filter === "all"
      ? eq(articles.userId, userId)
      : filter === "uncategorized"
        ? and(eq(articles.userId, userId), isNull(articles.categoryId))
        : and(eq(articles.userId, userId), eq(articles.categoryId, filter));

  return db
    .select({
      id: articles.id,
      source: articles.source,
      originalUrl: articles.originalUrl,
      originalTitle: articles.originalTitle,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      categoryId: articles.categoryId,
      categoryName: categories.name,
      publishedAt: articles.publishedAt,
      notionPageUrl: articles.notionPageUrl,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(where)
    .orderBy(
      sql`${articles.publishedAt} desc nulls last`,
      desc(articles.createdAt),
      desc(articles.id),
    )
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}

export type NewArticle = {
  source: string;
  originalUrl: string;
  originalTitle: string;
  originalSummary: string | null;
  publishedAt: Date | null;
};

// 이미 저장된 기사(userId + originalUrl)는 건드리지 않고 건너뛴다.
// 번역·카테고리·Notion 저장 상태가 재수집으로 덮어써지지 않게 DO NOTHING을 쓴다.
// 반환값은 실제로 새로 저장된 건수.
export async function insertNewArticles(userId: string, items: NewArticle[]) {
  if (items.length === 0) return 0;
  const inserted = await db
    .insert(articles)
    .values(items.map((item) => ({ ...item, userId })))
    .onConflictDoNothing({ target: [articles.userId, articles.originalUrl] })
    .returning({ id: articles.id });
  return inserted.length;
}

export type ArticleWithCategory = Awaited<ReturnType<typeof getArticlePage>>[number];

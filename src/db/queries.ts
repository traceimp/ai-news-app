import "server-only";
import { and, asc, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { CATEGORY_PALETTE, pickUnusedColor } from "@/lib/category-colors";
import { db } from "./index";
import { articles, categories } from "./schema";

// 모든 쿼리는 Clerk userId로 범위를 제한한다.

export async function getCategories(userId: string) {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
    })
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.createdAt), asc(categories.id));
}

export type ArticleFilter = "all" | "uncategorized" | number;

// 키워드 검색 조건: 한국어 제목·요약, 원문 제목에서 대소문자 구분 없이 부분 일치.
// LIKE 와일드카드(%, _, \)는 이스케이프해 입력한 글자 그대로 검색한다.
function keywordCondition(keyword?: string) {
  const trimmed = keyword?.trim();
  if (!trimmed) return undefined;
  const pattern = `%${trimmed.replace(/[\\%_]/g, "\\$&")}%`;
  return or(
    ilike(articles.titleKo, pattern),
    ilike(articles.summaryKo, pattern),
    ilike(articles.originalTitle, pattern),
  );
}

// 수집된 기사 총 개수. 대시보드 상단 배지용이라 카테고리·검색어와 무관하게 센다.
export async function getTotalArticleCount(userId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(articles)
    .where(eq(articles.userId, userId));
  return row?.count ?? 0;
}

// 카테고리별 기사 수. 카테고리 바의 칩에 표시한다. 검색어가 있으면 검색 결과 기준으로 센다.
export async function getArticleCounts(userId: string, keyword?: string) {
  const rows = await db
    .select({
      categoryId: articles.categoryId,
      count: sql<number>`count(*)::int`,
    })
    .from(articles)
    .where(and(eq(articles.userId, userId), keywordCondition(keyword)))
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
  keyword?: string,
) {
  const where = and(
    eq(articles.userId, userId),
    filter === "all"
      ? undefined
      : filter === "uncategorized"
        ? isNull(articles.categoryId)
        : eq(articles.categoryId, filter),
    keywordCondition(keyword),
  );

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
      categoryColor: categories.color,
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

export const DEFAULT_CATEGORIES = [
  "모델/제품",
  "연구",
  "투자·비즈니스",
  "규제·윤리",
];

// 처음 쓰는 사용자(카테고리가 하나도 없음)에게만 기본 카테고리를 만들어 준다.
// 사용자가 모두 지운 뒤에도 다시 생기지는 않도록 "비어 있을 때만" 만들지만,
// 동시 실행에 대비해 ON CONFLICT DO NOTHING을 쓴다.
export async function ensureDefaultCategories(userId: string) {
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.userId, userId))
    .limit(1);
  if (existing.length > 0) return;
  await db
    .insert(categories)
    .values(
      DEFAULT_CATEGORIES.map((name, i) => ({
        userId,
        name,
        color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length].key,
      })),
    )
    .onConflictDoNothing({ target: [categories.userId, categories.name] });
}

// 새 카테고리를 만들고, 이 사용자가 쓰지 않는 색을 배정한다.
// 같은 이름이 이미 있으면 null을 돌려준다.
export async function addCategory(userId: string, name: string) {
  const used = await db
    .select({ color: categories.color })
    .from(categories)
    .where(eq(categories.userId, userId));
  const color = pickUnusedColor(used.map((row) => row.color));
  const [created] = await db
    .insert(categories)
    .values({ userId, name, color })
    .onConflictDoNothing({ target: [categories.userId, categories.name] })
    .returning({ id: categories.id });
  return created ?? null;
}

// 번역 전(titleKo가 null)인 기사. 최신 발행일부터 처리하고, 한 번에 처리할 양에 상한을 둔다.
export async function getUntranslatedArticles(userId: string, limit = 60) {
  return db
    .select({
      id: articles.id,
      originalTitle: articles.originalTitle,
      originalSummary: articles.originalSummary,
    })
    .from(articles)
    .where(and(eq(articles.userId, userId), isNull(articles.titleKo)))
    .orderBy(sql`${articles.publishedAt} desc nulls last`, desc(articles.id))
    .limit(limit);
}

export async function updateArticleTranslation(
  userId: string,
  articleId: number,
  data: { titleKo: string; summaryKo: string; categoryId: number | null },
) {
  await db
    .update(articles)
    .set(data)
    .where(and(eq(articles.userId, userId), eq(articles.id, articleId)));
}

export async function getArticleForNotion(userId: string, articleId: number) {
  const [row] = await db
    .select({
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      source: articles.source,
      originalUrl: articles.originalUrl,
      publishedAt: articles.publishedAt,
      notionPageUrl: articles.notionPageUrl,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(and(eq(articles.userId, userId), eq(articles.id, articleId)))
    .limit(1);
  return row ?? null;
}

export async function setArticleNotionUrl(
  userId: string,
  articleId: number,
  url: string,
) {
  await db
    .update(articles)
    .set({ notionPageUrl: url })
    .where(and(eq(articles.userId, userId), eq(articles.id, articleId)));
}

// 본인(userId) 소유의 기사만 삭제한다. 삭제된 행이 있으면 true.
export async function deleteArticle(userId: string, articleId: number) {
  const deleted = await db
    .delete(articles)
    .where(and(eq(articles.userId, userId), eq(articles.id, articleId)))
    .returning({ id: articles.id });
  return deleted.length > 0;
}

export type ArticleWithCategory = Awaited<
  ReturnType<typeof getArticlePage>
>[number];

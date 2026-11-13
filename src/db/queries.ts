import "server-only";
import { asc, desc, eq, sql } from "drizzle-orm";
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

// 최신 발행일순. 발행일이 없는 기사는 맨 뒤로 보내고, 같으면 수집 순서의 역순.
export async function getArticles(userId: string) {
  return db
    .select({
      id: articles.id,
      source: articles.source,
      originalUrl: articles.originalUrl,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      categoryId: articles.categoryId,
      categoryName: categories.name,
      publishedAt: articles.publishedAt,
      notionPageUrl: articles.notionPageUrl,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.userId, userId))
    .orderBy(sql`${articles.publishedAt} desc nulls last`, desc(articles.createdAt));
}

export type ArticleWithCategory = Awaited<ReturnType<typeof getArticles>>[number];

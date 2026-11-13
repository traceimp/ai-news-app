import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    // 색상 팔레트 키(src/lib/category-colors.ts). 사용자 안에서 서로 겹치지 않게 배정한다.
    color: text("color"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("categories_user_name_unique").on(t.userId, t.name)],
);

export const articles = pgTable(
  "articles",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    source: text("source").notNull(), // TechCrunch / The Verge
    originalUrl: text("original_url").notNull(),
    originalTitle: text("original_title").notNull(),
    // RSS 원문 설명(HTML 제거본). 번역·요약 단계의 입력으로 쓴다.
    originalSummary: text("original_summary"),
    // null이면 아직 번역되지 않은 기사 (번역은 수집과 분리된 별도 단계)
    titleKo: text("title_ko"),
    summaryKo: text("summary_ko"),
    // 카테고리 삭제 시 null = "미분류"
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    notionPageUrl: text("notion_page_url"), // null이면 미저장
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("articles_user_url_unique").on(t.userId, t.originalUrl),
    index("articles_user_published_idx").on(t.userId, t.publishedAt),
    index("articles_user_category_idx").on(t.userId, t.categoryId),
  ],
);

export type Category = typeof categories.$inferSelect;
export type Article = typeof articles.$inferSelect;

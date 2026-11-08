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
    titleKo: text("title_ko").notNull(),
    summaryKo: text("summary_ko").notNull(),
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

import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { db } = await import("../src/db");
  const { articles, categories } = await import("../src/db/schema");
  const { eq, and } = await import("drizzle-orm");
  const userId = "db-check-user";

  const [cat] = await db.insert(categories).values({ userId, name: "테스트" }).returning();
  const [art] = await db.insert(articles).values({
    userId, source: "TechCrunch", originalUrl: "https://example.com/a",
    originalTitle: "t", titleKo: "제목", summaryKo: "요약", categoryId: cat.id,
  }).returning();
  console.log("insert ok:", art.titleKo, "category", art.categoryId);

  let dup = false;
  try {
    const { id: _id, ...rest } = art; await db.insert(articles).values(rest);
  } catch { dup = true; }
  console.log("unique(userId, originalUrl) enforced:", dup);

  await db.delete(categories).where(eq(categories.id, cat.id));
  const [after] = await db.select().from(articles).where(and(eq(articles.userId, userId), eq(articles.id, art.id)));
  console.log("after category delete, categoryId =", after.categoryId);

  await db.delete(articles).where(eq(articles.userId, userId));
  console.log("cleanup ok");
  process.exit(0);
}
main().catch((e) => { console.error("FAIL", e); process.exit(1); });

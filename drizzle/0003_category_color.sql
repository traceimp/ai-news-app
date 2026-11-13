ALTER TABLE "categories" ADD COLUMN "color" text;--> statement-breakpoint
-- 기존 카테고리에 사용자별로 생성 순서대로 서로 다른 색을 배정한다. (팔레트: src/lib/category-colors.ts)
UPDATE "categories" AS c
SET "color" = (ARRAY['sky','emerald','amber','rose','violet','orange','teal','fuchsia','lime','stone'])[((r.rn - 1) % 10) + 1]
FROM (
  SELECT "id", row_number() OVER (PARTITION BY "user_id" ORDER BY "created_at", "id") AS rn
  FROM "categories"
) AS r
WHERE c."id" = r."id";

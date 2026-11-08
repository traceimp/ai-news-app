import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // 마이그레이션은 직접(unpooled) 연결로 실행한다.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED! },
});

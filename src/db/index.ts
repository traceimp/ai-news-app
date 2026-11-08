import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// 앱 쿼리는 풀링된 연결(DATABASE_URL, -pooler)을 사용한다. 서버 전용 모듈이다.
const globalForDb = globalThis as unknown as { pgPool?: Pool };

const pool =
  globalForDb.pgPool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });

if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool;

export const db = drizzle(pool, { schema });

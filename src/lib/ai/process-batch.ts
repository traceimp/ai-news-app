import "server-only";
import {
  ensureDefaultCategories,
  getCategories,
  getUntranslatedArticles,
  updateArticleTranslation,
} from "@/db/queries";
import { MissingApiKeyError } from "./client";
import { processArticle } from "./process-article";

const CONCURRENCY = 3;

export type ProcessResult = {
  translated: number; // 번역·요약·분류까지 저장된 기사
  failed: number; // 처리에 실패해 다음 실행 때 재시도할 기사
};

// titleKo가 비어 있는 기사(방금 수집한 것 + 이전에 실패한 것)를 Claude로 처리한다.
// 기사 하나가 실패해도 나머지는 계속 처리한다.
export async function processPendingArticles(userId: string): Promise<ProcessResult> {
  const pending = await getUntranslatedArticles(userId);
  if (pending.length === 0) return { translated: 0, failed: 0 };

  if (!process.env.ANTHROPIC_API_KEY?.trim()) throw new MissingApiKeyError();

  await ensureDefaultCategories(userId);
  const categories = await getCategories(userId);
  const idByName = new Map(categories.map((c) => [c.name, c.id]));
  const names = categories.map((c) => c.name);

  let translated = 0;
  let failed = 0;
  let next = 0;

  async function worker() {
    while (next < pending.length) {
      const article = pending[next++];
      try {
        const result = await processArticle(article, names);
        await updateArticleTranslation(userId, article.id, {
          titleKo: result.titleKo,
          summaryKo: result.summaryKo,
          categoryId: result.categoryName ? (idByName.get(result.categoryName) ?? null) : null,
        });
        translated++;
      } catch (error) {
        failed++;
        console.error("processArticle failed", article.id, error);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, pending.length) }, worker));
  return { translated, failed };
}

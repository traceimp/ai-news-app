"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getArticleForNotion, setArticleNotionUrl } from "@/db/queries";
import { createNotionPage, MissingNotionConfigError } from "@/lib/notion/save";

export type SaveToNotionResult = { ok: true; url: string } | { ok: false; message: string };

// Server Action은 직접 POST로도 호출될 수 있으므로 로그인과 소유권을 여기서 확인한다.
export async function saveToNotionAction(articleId: number): Promise<SaveToNotionResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "로그인이 필요해요." };
  if (!Number.isInteger(articleId)) return { ok: false, message: "잘못된 요청이에요." };

  const article = await getArticleForNotion(userId, articleId);
  if (!article) return { ok: false, message: "기사를 찾을 수 없어요." };
  // 이미 저장된 기사는 중복 저장하지 않는다.
  if (article.notionPageUrl) return { ok: true, url: article.notionPageUrl };
  if (!article.titleKo || !article.summaryKo) {
    return { ok: false, message: "번역이 끝난 뒤에 저장할 수 있어요." };
  }

  try {
    const url = await createNotionPage({
      titleKo: article.titleKo,
      summaryKo: article.summaryKo,
      categoryName: article.categoryName,
      source: article.source,
      originalUrl: article.originalUrl,
      publishedAt: article.publishedAt,
    });
    await setArticleNotionUrl(userId, articleId, url);
    revalidatePath("/dashboard");
    return { ok: true, url };
  } catch (error) {
    console.error("saveToNotionAction failed", error);
    return {
      ok: false,
      message:
        error instanceof MissingNotionConfigError
          ? error.message
          : "Notion에 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
    };
  }
}

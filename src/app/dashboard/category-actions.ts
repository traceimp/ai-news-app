"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { addCategory } from "@/db/queries";

const MAX_NAME_LENGTH = 20;

export type AddCategoryResult = { ok: true } | { ok: false; message: string };

// Server Action은 직접 POST로도 호출될 수 있으므로 로그인과 입력을 여기서 다시 확인한다.
export async function addCategoryAction(rawName: string): Promise<AddCategoryResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "로그인이 필요해요." };

  const name = typeof rawName === "string" ? rawName.trim().replace(/\s+/g, " ") : "";
  if (!name) return { ok: false, message: "카테고리 이름을 입력해 주세요." };
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, message: `이름은 ${MAX_NAME_LENGTH}자까지 쓸 수 있어요.` };
  }

  try {
    const created = await addCategory(userId, name);
    if (!created) return { ok: false, message: "이미 있는 카테고리예요" };
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    console.error("addCategoryAction failed", error);
    return { ok: false, message: "카테고리를 추가하지 못했어요. 다시 시도해 주세요." };
  }
}

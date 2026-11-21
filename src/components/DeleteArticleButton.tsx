"use client";

import { useState, useTransition } from "react";
import { deleteArticleAction } from "@/app/dashboard/actions";

// 카드 오른쪽 상단의 X 버튼. 삭제에 성공하면 카드를 화면에서 바로 숨긴다.
export function DeleteArticleButton({ articleId }: { articleId: number }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteArticleAction(articleId);
        if (!result.ok) setError(result.message);
      } catch {
        setError("삭제하지 못했어요. 다시 시도해 주세요.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label="뉴스 삭제"
        title="뉴스 삭제"
        className="absolute right-2 top-2 flex size-7 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      >
        <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </>
  );
}

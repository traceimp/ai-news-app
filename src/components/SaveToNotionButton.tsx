"use client";

import { useState, useTransition } from "react";
import { saveToNotionAction } from "@/app/dashboard/notion-actions";

const linkClass =
  "text-sm text-slate-500 underline-offset-4 hover:text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:text-neutral-400";

export function SaveToNotionButton({
  articleId,
  notionPageUrl,
  disabled,
}: {
  articleId: number;
  notionPageUrl: string | null;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [savedUrl, setSavedUrl] = useState(notionPageUrl);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await saveToNotionAction(articleId);
        if (result.ok) setSavedUrl(result.url);
        else setError(result.message);
      } catch {
        setError("요청에 실패했어요. 다시 시도해 주세요.");
      }
    });
  }

  if (savedUrl) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 disabled:cursor-default dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
        >
          저장 완료 ✓
        </button>
        <a
          href={savedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Notion에서 보기 ↗
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending || disabled}
        title={disabled ? "번역이 끝난 뒤에 저장할 수 있어요" : undefined}
        className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:bg-transparent disabled:hover:text-slate-700 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-indigo-400 dark:hover:bg-indigo-950 dark:hover:text-indigo-300 dark:disabled:hover:border-neutral-700 dark:disabled:hover:text-neutral-200"
      >
        {isPending ? "저장 중…" : "Notion 저장"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

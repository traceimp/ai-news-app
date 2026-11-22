"use client";

import { useState, useTransition } from "react";
import { fetchNewsAction, type FetchNewsResult } from "@/app/dashboard/actions";

export function FetchNewsButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<FetchNewsResult | null>(null);

  function handleClick() {
    setResult(null);
    startTransition(async () => {
      try {
        setResult(await fetchNewsAction());
      } catch {
        setResult({ ok: false, message: "요청에 실패했어요. 다시 시도해 주세요." });
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {isPending ? "가져오는 중…" : "뉴스 가져오기"}
      </button>

      <div aria-live="polite">
        {isPending && (
          <p className="text-sm text-slate-500 dark:text-neutral-400">
            최근 24시간 뉴스를 가져와 한국어로 번역·요약하고 있어요. 기사가 많으면 1~2분 걸릴 수 있어요…
          </p>
        )}

        {result?.ok && (
          <p className="rounded-lg bg-indigo-50 px-4 py-3 text-sm text-slate-700 dark:bg-indigo-950 dark:text-neutral-300">
            신규 {result.added}건 · 건너뜀 {result.skipped}건 · 번역 {result.translated}건
            {result.failed > 0 && (
              <>
                {" · "}
                <span className="text-red-600 dark:text-red-400">번역 실패 {result.failed}건</span>
              </>
            )}
            {result.failedSources.length > 0 && (
              <>
                {" · "}
                <span className="text-red-600 dark:text-red-400">
                  실패 {result.failedSources.length}곳 ({result.failedSources.join(", ")})
                </span>
              </>
            )}
          </p>
        )}

        {result?.ok && result.aiError && (
          <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {result.aiError}
          </p>
        )}

        {result && !result.ok && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {result.message}
          </p>
        )}
      </div>
    </div>
  );
}

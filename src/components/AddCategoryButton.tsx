"use client";

import { useRef, useState, useTransition } from "react";
import { addCategoryAction } from "@/app/dashboard/category-actions";

const MAX_NAME_LENGTH = 20;

// '+ 카테고리 추가' 버튼. 누르면 같은 자리에서 입력창으로 바뀐다. (Enter 확정, Esc 취소)
export function AddCategoryButton() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function open() {
    setEditing(true);
    // 입력창이 그려진 뒤에 포커스를 준다.
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function close() {
    setEditing(false);
    setName("");
    setError(null);
  }

  function submit() {
    if (isPending) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await addCategoryAction(name);
        if (result.ok) close();
        else setError(result.message);
      } catch {
        setError("요청에 실패했어요. 다시 시도해 주세요.");
      }
    });
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={open}
        className="cursor-pointer rounded-full border border-dashed border-slate-300 px-4 py-1.5 text-sm text-slate-500 hover:border-indigo-600 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-neutral-700 dark:text-neutral-400"
      >
        + 카테고리 추가
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={name}
          maxLength={MAX_NAME_LENGTH}
          disabled={isPending}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            // 한글 조합 중 Enter는 확정으로 보지 않는다.
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            } else if (e.key === "Escape") {
              close();
            }
          }}
          placeholder="새 카테고리 이름"
          aria-label="새 카테고리 이름"
          aria-invalid={error ? true : undefined}
          className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
        <button
          type="button"
          onClick={submit}
          disabled={isPending || name.trim() === ""}
          className="cursor-pointer rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "추가 중…" : "추가"}
        </button>
        <button
          type="button"
          onClick={close}
          disabled={isPending}
          className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          취소
        </button>
      </div>
      <p aria-live="polite" className="min-h-4 text-xs text-red-600 dark:text-red-400">
        {error}
      </p>
    </div>
  );
}

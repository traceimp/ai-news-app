"use client";

// 다크/라이트 모드 토글. 현재 테마는 <html>의 .dark 클래스가 기준이며,
// 아이콘은 CSS(dark: 변형)로 전환해 서버/클라이언트 렌더 결과가 항상 같다.
export const THEME_STORAGE_KEY = "theme";

export default function ThemeToggle() {
  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 이번 방문에만 적용한다.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="다크 모드/라이트 모드 전환"
      title="다크 모드/라이트 모드 전환"
      className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      {/* 라이트 모드일 때: 달 아이콘(누르면 다크로) */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 dark:hidden"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      {/* 다크 모드일 때: 해 아이콘(누르면 라이트로) */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="hidden size-5 dark:block"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    </button>
  );
}

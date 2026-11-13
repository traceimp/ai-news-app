// 카테고리 색상 팔레트. 서로 색상(hue)이 뚜렷이 다른 10색이다.
// 강조색(인디고)은 선택 상태에 쓰이므로 팔레트에서 뺐다.
// Tailwind가 클래스를 찾을 수 있도록 클래스 이름은 문자열 그대로 적는다.
export const CATEGORY_PALETTE = [
  { key: "sky", badge: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300", dot: "bg-sky-500" },
  { key: "emerald", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300", dot: "bg-emerald-500" },
  { key: "amber", badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300", dot: "bg-amber-500" },
  { key: "rose", badge: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300", dot: "bg-rose-500" },
  { key: "violet", badge: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300", dot: "bg-violet-500" },
  { key: "orange", badge: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300", dot: "bg-orange-500" },
  { key: "teal", badge: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300", dot: "bg-teal-500" },
  { key: "fuchsia", badge: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300", dot: "bg-fuchsia-500" },
  { key: "lime", badge: "bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-300", dot: "bg-lime-500" },
  { key: "stone", badge: "bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200", dot: "bg-stone-500" },
] as const;

export type CategoryColorKey = (typeof CATEGORY_PALETTE)[number]["key"];

// "미분류"는 어느 팔레트 색과도 구분되는 회색 톤을 쓴다.
export const UNCATEGORIZED_COLOR = {
  badge: "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300",
  dot: "bg-slate-400",
};

export function getCategoryColor(key: string | null | undefined) {
  return CATEGORY_PALETTE.find((c) => c.key === key) ?? UNCATEGORIZED_COLOR;
}

// 사용 중이지 않은 첫 색을 고른다. 10색을 모두 쓰고 있으면 가장 적게 쓴 색을 재사용한다.
export function pickUnusedColor(usedKeys: (string | null)[]): CategoryColorKey {
  const counts = new Map<string, number>();
  for (const key of usedKeys) if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  let best: CategoryColorKey = CATEGORY_PALETTE[0].key;
  let bestCount = Infinity;
  for (const { key } of CATEGORY_PALETTE) {
    const n = counts.get(key) ?? 0;
    if (n < bestCount) {
      best = key;
      bestCount = n;
      if (n === 0) break;
    }
  }
  return best;
}

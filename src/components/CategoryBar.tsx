import Link from "next/link";
import { getCategoryColor, UNCATEGORIZED_COLOR } from "@/lib/category-colors";
import { AddCategoryButton } from "./AddCategoryButton";

export type CategoryFilter = "all" | "uncategorized" | number;

type Props = {
  categories: { id: number; name: string; color: string | null }[];
  counts: { total: number; uncategorized: number; byCategory: Map<number, number> };
  selected: CategoryFilter;
};

const chipBase =
  "rounded-full border px-4 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600";
const chipIdle =
  "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800";
const chipSelected = "border-indigo-600 bg-indigo-600 text-white";

function Chip({
  href,
  label,
  dot,
  count,
  active,
}: {
  href: string;
  label: string;
  dot?: string; // 카테고리 색상 점 (전체에는 없음)
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`${chipBase} ${active ? chipSelected : chipIdle}`}
    >
      {dot && (
        // 선택된 칩(인디고 배경)에서도 색이 보이도록 흰 테두리를 둔다.
        <span
          aria-hidden
          className={`mr-2 inline-block size-2.5 rounded-full align-baseline ${dot} ${active ? "ring-2 ring-white" : ""}`}
        />
      )}
      {label} <span className="text-xs opacity-70">{count}</span>
    </Link>
  );
}

// 항목 순서: 전체 → 사용자 카테고리 → 미분류 → 카테고리 추가 버튼
export function CategoryBar({ categories, counts, selected }: Props) {
  return (
    <nav aria-label="카테고리" className="flex flex-wrap items-center gap-2">
      <Chip
        href="/dashboard"
        label="전체"
        count={counts.total}
        active={selected === "all"}
      />
      {categories.map((c) => (
        <Chip
          key={c.id}
          href={`/dashboard?category=${c.id}`}
          label={c.name}
          dot={getCategoryColor(c.color).dot}
          count={counts.byCategory.get(c.id) ?? 0}
          active={selected === c.id}
        />
      ))}
      <Chip
        href="/dashboard?category=uncategorized"
        label="미분류"
        dot={UNCATEGORIZED_COLOR.dot}
        count={counts.uncategorized}
        active={selected === "uncategorized"}
      />
      <AddCategoryButton />
    </nav>
  );
}

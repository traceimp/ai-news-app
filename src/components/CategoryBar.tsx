import Link from "next/link";

export type CategoryFilter = "all" | "uncategorized" | number;

type Props = {
  categories: { id: number; name: string }[];
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
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`${chipBase} ${active ? chipSelected : chipIdle}`}
    >
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
          count={counts.byCategory.get(c.id) ?? 0}
          active={selected === c.id}
        />
      ))}
      <Chip
        href="/dashboard?category=uncategorized"
        label="미분류"
        count={counts.uncategorized}
        active={selected === "uncategorized"}
      />
      {/* 카테고리 추가는 3단계(카테고리 CRUD)에서 구현한다. */}
      <button
        type="button"
        disabled
        title="카테고리 추가는 다음 단계에서 구현합니다"
        className="rounded-full border border-dashed border-slate-300 px-4 py-1.5 text-sm text-slate-500 hover:border-indigo-600 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-slate-300 disabled:hover:text-slate-500 dark:border-neutral-700 dark:text-neutral-400"
      >
        + 카테고리 추가
      </button>
    </nav>
  );
}

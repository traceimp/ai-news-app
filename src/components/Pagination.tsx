import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  // 페이지 번호를 받아 링크 주소를 만든다 (카테고리 필터 등 다른 쿼리를 유지하기 위해)
  hrefFor: (page: number) => string;
};

// 현재 페이지 앞뒤 2개씩 + 항상 첫/마지막 페이지를 보여준다. (예: 1 … 48 49 [50] 51 52 … 100)
// 보이는 번호끼리 이어지지 않는 곳에만 … 을 넣는다.
const SIBLINGS = 2;

function pageList(page: number, totalPages: number): (number | "gap")[] {
  const wanted = new Set([1, totalPages]);
  for (let n = page - SIBLINGS; n <= page + SIBLINGS; n++) wanted.add(n);
  const sorted = [...wanted].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) result.push("gap");
    result.push(n);
  });
  return result;
}

const itemBase =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600";
const itemIdle =
  "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800";
const itemActive = "border-indigo-600 bg-indigo-600 text-white";
const itemDisabled =
  "cursor-not-allowed border-slate-200 bg-white text-slate-400 opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500";

// 이동 버튼(처음/이전/다음/끝): 이동할 수 없으면 링크 대신 비활성 표시
function NavButton({
  label,
  ariaLabel,
  target,
  hrefFor,
}: {
  label: string;
  ariaLabel: string;
  target: number | null; // null이면 비활성
  hrefFor: (page: number) => string;
}) {
  if (target === null) {
    return (
      <span aria-disabled="true" aria-label={ariaLabel} className={`${itemBase} ${itemDisabled}`}>
        {label}
      </span>
    );
  }
  return (
    <Link href={hrefFor(target)} aria-label={ariaLabel} className={`${itemBase} ${itemIdle}`}>
      {label}
    </Link>
  );
}

export function Pagination({ page, totalPages, hrefFor }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="페이지" className="flex flex-wrap items-center justify-center gap-2 pt-2">
      <NavButton label="처음" ariaLabel="첫 페이지" target={page > 1 ? 1 : null} hrefFor={hrefFor} />
      <NavButton label="이전" ariaLabel="이전 페이지" target={page > 1 ? page - 1 : null} hrefFor={hrefFor} />

      {pageList(page, totalPages).map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} aria-hidden className="px-1 text-slate-500 dark:text-neutral-400">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-current={item === page ? "page" : undefined}
            aria-label={`${item}페이지`}
            className={`${itemBase} ${item === page ? itemActive : itemIdle}`}
          >
            {item}
          </Link>
        ),
      )}

      <NavButton
        label="다음"
        ariaLabel="다음 페이지"
        target={page < totalPages ? page + 1 : null}
        hrefFor={hrefFor}
      />
      <NavButton
        label="끝"
        ariaLabel="마지막 페이지"
        target={page < totalPages ? totalPages : null}
        hrefFor={hrefFor}
      />
    </nav>
  );
}

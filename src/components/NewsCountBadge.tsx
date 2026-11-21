import { auth } from "@clerk/nextjs/server";
import { getTotalArticleCount } from "@/db/queries";

// 대시보드 상단에 수집된 뉴스 총 개수를 보여주는 배지 (서버 컴포넌트).
export async function NewsCountBadge() {
  const { userId } = await auth();
  if (!userId) return null;

  const total = await getTotalArticleCount(userId);

  return (
    <span
      aria-live="polite"
      className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
    >
      총 {total.toLocaleString("ko-KR")}개의 뉴스
    </span>
  );
}

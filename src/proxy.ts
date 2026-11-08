import { clerkMiddleware } from "@clerk/nextjs/server";

// 로그인은 모달로 처리하므로 별도 로그인 페이지가 없다.
// API는 모두 로그인 필수(미로그인 시 401/404 처리), 페이지는 로그인 전에는
// 로그인 화면(src/app/page.tsx)만 보이고 데이터는 노출되지 않는다.
export default clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname.startsWith("/api")) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Next.js 내부 파일과 정적 파일은 제외
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API 라우트는 항상 실행
    "/(api|trpc)(.*)",
  ],
};

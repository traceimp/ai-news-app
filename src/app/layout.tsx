import type { Metadata } from "next";
import { Suspense } from "react";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import { Geist_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 뉴스 수집기",
  description: "해외 AI 뉴스를 한국어로 번역·요약해 보여주는 앱",
};

// 첫 페인트 전에 테마 클래스를 붙여 깜빡임(FOUC)을 막는다.
// 저장된 선택이 없으면 OS 설정(prefers-color-scheme)을 따른다.
const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {/* cacheComponents 사용 시 로그인 상태가 서버에서 전달되도록 dynamic + Suspense */}
        <Suspense fallback={null}>
          <ClerkProvider dynamic>
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 dark:border-neutral-800 dark:bg-neutral-900/80">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-neutral-100">
                AI 뉴스 수집기
              </span>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </header>
            {children}
            <Footer />
          </ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 뉴스 수집기",
  description: "해외 AI 뉴스를 한국어로 번역·요약해 보여주는 앱",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* cacheComponents 사용 시 로그인 상태가 서버에서 전달되도록 dynamic + Suspense */}
        <Suspense fallback={null}>
          <ClerkProvider dynamic>
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 dark:border-neutral-800 dark:bg-neutral-900/80">
              <span className="text-lg font-bold tracking-tight">AI 뉴스 수집기</span>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </header>
            {children}
          </ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}

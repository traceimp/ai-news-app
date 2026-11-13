import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <>
      <Show when="signed-out">
        <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
          <h1 className="text-2xl font-bold">AI 뉴스 수집기</h1>
          <p className="text-zinc-600">
            해외 AI 뉴스를 한국어로 정리해 보려면 먼저 로그인하세요.
          </p>
          <div className="flex gap-3">
            <SignInButton mode="modal">
              <button className="rounded-full bg-black px-5 py-2 text-white">
                로그인
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full border px-5 py-2">
                회원가입
              </button>
            </SignUpButton>
          </div>
        </main>
      </Show>
      <Show when="signed-in">
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <p>로그인되었습니다.</p>
          <Link
            href="/dashboard"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            대시보드로 이동
          </Link>
        </main>
      </Show>
    </>
  );
}

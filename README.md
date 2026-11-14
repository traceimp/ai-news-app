# AI 뉴스 수집기

해외 AI 뉴스를 RSS로 수집하고, Claude가 한국어로 번역·요약·카테고리 분류한 결과를 카드로 보여주는 웹앱입니다. 마음에 드는 뉴스는 버튼 한 번으로 Notion 데이터베이스에 저장할 수 있습니다. Clerk 로그인 기반이라 여러 명이 써도 데이터는 사용자별로 분리됩니다.

## 주요 기능

- **뉴스 가져오기**: 버튼을 누르면 TechCrunch AI, The Verge AI 피드에서 최근 24시간 기사(피드당 최대 20건)를 수집합니다. 이미 저장된 기사는 건너뜁니다.
- **한국어 번역·요약·분류**: Claude(`claude-haiku-5-5`)가 한국어 제목, 2~3문장 요약, 카테고리를 만듭니다. 실패한 기사는 다음 실행 때 다시 시도합니다.
- **카테고리 관리**: 기본 카테고리(모델/제품, 연구, 투자·비즈니스, 규제·윤리)를 제공하며, 추가·수정·삭제와 필터링이 가능합니다.
- **Notion 저장**: 카드의 `Notion 저장` 버튼을 누르면 Notion MCP 서버를 통해 데이터베이스에 페이지가 만들어지고, 버튼이 `저장 완료`로 바뀝니다. 중복 저장은 막습니다.
- **보안**: 모든 페이지와 API는 로그인 사용자만 접근할 수 있고, 모든 DB 쿼리는 Clerk `userId`로 범위가 제한됩니다.

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| 로그인 | Clerk |
| 데이터베이스 | Neon Postgres + Drizzle ORM |
| 번역·요약·분류 | Claude API (`@anthropic-ai/sdk`) |
| Notion 저장 | Notion MCP 서버 (`@notionhq/notion-mcp-server`, 서버에서 MCP 클라이언트로 연결) |

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경변수

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 채웁니다. 모두 서버 전용이므로 `NEXT_PUBLIC_`을 붙이지 마세요(Clerk publishable key 제외).

```env
# Clerk (https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Neon Postgres
DATABASE_URL=

# Claude API (https://console.anthropic.com)
ANTHROPIC_API_KEY=

# Notion (https://www.notion.so/profile/integrations 에서 내부 통합 생성)
NOTION_API_TOKEN=
NOTION_DATABASE_ID=
```

### 3. Notion 데이터베이스 준비

저장 대상 데이터베이스에 아래 속성이 있어야 합니다. 그리고 데이터베이스 우측 상단 `···` → `연결`에서 만든 통합을 연결해야 합니다.

| 속성 이름 | 타입 |
|---|---|
| 제목 | 제목(title) |
| 요약 | 텍스트 |
| 카테고리 | 선택(select) |
| 출처 | 선택(select) |
| 원문 링크 | URL |
| 발행일 | 날짜 |

`NOTION_DATABASE_ID`에는 데이터베이스 URL의 32자리 ID를 넣습니다.

### 4. 데이터베이스 마이그레이션

```bash
npx drizzle-kit migrate
```

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에 접속해 로그인하면 `/dashboard`로 이동합니다.

## 명령어

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 실행 |

## 프로젝트 구조

```
src/
├─ app/dashboard/       대시보드 페이지와 Server Actions (뉴스 가져오기, 카테고리, Notion 저장)
├─ components/          뉴스 카드, 카테고리 바, 버튼 등 UI 컴포넌트
├─ db/                  Drizzle 스키마와 쿼리 (모든 쿼리는 userId로 제한)
├─ lib/rss/             RSS 수집·파싱
├─ lib/ai/              Claude 번역·요약·분류
├─ lib/notion/          Notion MCP 클라이언트
└─ proxy.ts             Clerk 인증 (모든 경로 보호)
drizzle/                마이그레이션 SQL
scripts/                DB 점검·샘플 데이터 스크립트
```

## 문서

- [`PRD.md`](PRD.md): 제품 명세
- [`ui.md`](ui.md): UI 가이드 (디자인 토큰, 레이아웃, 카드 스타일)
- [`CLAUDE.md`](CLAUDE.md): 개발 규칙과 아키텍처

## 배포 시 참고

Notion 저장은 서버에서 Node 자식 프로세스로 MCP 서버를 실행합니다. Vercel 같은 서버리스 환경에 배포할 때는 이 방식이 동작하는지 먼저 확인해야 합니다.

## 범위 밖

자동 주기 수집, 소셜 공유·댓글·알림, 기사 원문 전체 번역, 모바일 네이티브 앱은 다루지 않습니다.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

해외 AI 뉴스를 RSS로 수집하고, Claude가 한국어로 번역·요약·카테고리 분류한 결과를 카드로 보여주는 웹앱. 마음에 드는 뉴스는 Notion에 저장한다. 대상 사용자는 해외 AI 동향을 한국어로 정리해 보고 싶은 개인이며, Clerk 로그인 기반으로 여러 명이 써도 데이터는 사용자별로 분리된다.

`PRD.md`가 제품 명세(한국어)의 기준 문서다. 현재는 `create-next-app`으로 만든 Next.js 16 보일러플레이트(App Router, `src/`, Tailwind v4, TypeScript, npm)만 있고 앱 코드는 아직 없다. 새 기능을 구현하기 전에 PRD의 해당 절을 읽는다.

UI를 만들거나 수정할 때는 `ui.md`(UI 가이드: 디자인 토큰, 대시보드 레이아웃, 카테고리 바, 뉴스 카드 스타일)를 먼저 읽고 따른다. 스타일 규칙이 바뀌면 `ui.md`도 함께 갱신한다.

### 개발 단계 (PRD 12절, 이 순서로 진행)
1. Next.js 초기화 + Clerk 로그인
2. Neon + Drizzle 스키마/마이그레이션
3. 카테고리 CRUD
4. RSS 수집 + Claude 처리 + 카드 UI + 필터
5. Notion MCP 저장
6. 다듬기/배포

### 비목표 (범위 밖)
- 자동 주기 수집(스케줄링). 사용자가 버튼을 눌렀을 때만 수집한다.
- 소셜 공유, 댓글, 알림.
- 기사 원문 전체 번역 (요약 중심).
- 모바일 네이티브 앱.

## 명령어

- `npm run dev` — 개발 서버. 종료는 실행 중인 터미널에서 `Ctrl + C` (확인 문구가 나오면 `Y` + Enter)
- 포트 3000이 이미 사용 중일 때(남은 프로세스 종료): `netstat -ano | findstr :3000` 로 PID 확인 후 `taskkill /PID <PID> /F`
- `npm run build` / `npm start` — 프로덕션 빌드 / 실행
- `npm run lint` — ESLint (`eslint` 직접 실행, `next lint` 아님)
- 테스트 러너는 아직 설정되지 않았다.

## Next.js 주의사항

`AGENTS.md`에 따르면 이 Next.js(16.4.5)는 학습 데이터와 API/규칙이 다를 수 있다. 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 관련 가이드를 읽고 deprecation 알림을 따른다. (`AGENTS.md`의 해당 블록은 `next dev`가 다시 생성하므로 삭제하지 않는다.)

## 아키텍처 (PRD 기준 계획)

### 기술 스택
Next.js / Clerk(로그인) / Neon Postgres + Drizzle ORM / Claude API(번역·요약·분류) / Notion MCP 서버(서버에서 MCP 클라이언트로 연결).

### 인증·보안
- 앱 실행 시 비로그인이면 Clerk 로그인 화면으로 이동. **모든 페이지와 API**는 로그인 사용자만 접근 가능.
- 모든 DB 쿼리는 Clerk `userId`로 범위를 제한한다 (다른 계정으로 로그인하면 데이터가 분리되어 보여야 함).
- API 키(Claude, Notion, DB)는 서버 환경변수로만 사용하고 클라이언트에 노출하지 않는다.

### 환경변수
Clerk 키(publishable / secret), `DATABASE_URL`(Neon), `ANTHROPIC_API_KEY`, Notion 연동 정보(인증 토큰, 저장 대상 DB 또는 부모 페이지 ID).

### 데이터 모델 (Drizzle)
- **categories**: `id`(PK), `userId`, `name`, `createdAt`. `userId+name` 유니크.
- **articles**: `id`(PK), `userId`, `source`(TechCrunch / The Verge), `originalUrl`, `originalTitle`, `originalSummary`(RSS 원문 설명, null 가능), `titleKo`/`summaryKo`(null이면 아직 번역 전), `categoryId`(categories FK, 삭제 시 null = "미분류"), `publishedAt`, `notionPageUrl`(null이면 미저장), `createdAt`. `userId+originalUrl` 유니크.

### 뉴스 소스 (RSS)
| 소스 | URL |
|---|---|
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ |
| The Verge AI | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml |

### 뉴스 가져오기 흐름
> 구현 현황: 수집(`src/lib/rss/`, `src/app/dashboard/actions.ts`)과 번역·분류는 **분리**되어 있다. 수집은 최근 24시간·피드당 최대 20건을 `titleKo`/`summaryKo`=null로 저장만 하고(`ON CONFLICT DO NOTHING`), 번역·요약·분류(아래 3번)는 `titleKo IS NULL`인 기사를 대상으로 하는 별도 단계에서 처리한다(미구현).

1. '뉴스 가져오기' 버튼 클릭 시에만 실행 → 두 RSS 피드 조회, 피드당 최신 N개(기본값 예: 10)만 대상. 가져오기 건수에 상한을 둔다.
2. 이미 저장된 기사(사용자별 `originalUrl` 기준)는 Claude 호출 없이 건너뜀 (비용 절감).
3. 신규 기사마다 Claude를 한 번 호출해 한국어 제목, 한국어 요약, 카테고리를 JSON으로 받고 **JSON 스키마로 검증**한다.
4. 일부 기사 처리에 실패해도 나머지는 저장하고, 진행 중(로딩) 상태와 결과(신규 N건 / 건너뜀 N건 / 실패 N건)를 표시한다.
5. 서버리스 실행 시간 제한을 고려해 순차 또는 제한된 병렬 처리를 하고, 필요하면 스트리밍/분할 처리한다.

### 카테고리
- 기본 카테고리(처음 사용 시 제공): 모델/제품, 연구, 투자·비즈니스, 규제·윤리.
- 신규 기사는 사용자의 **현재** 카테고리 목록 중에서 Claude가 자동 분류하고, 맞는 게 없으면 "미분류".
- 추가·이름 수정·삭제를 언제든 할 수 있다. 삭제된 카테고리의 기사는 "미분류"로 이동. 같은 이름 중복 생성 불가.
- 카테고리 필터 선택 시 해당 뉴스만 표시, '전체' 보기도 제공.

### 뉴스 카드 UI
- 표시 항목: 한국어 제목, 한국어 요약, 카테고리 배지, 출처, 발행일, 원문 링크. 최신 발행일순 정렬.
- 'Notion 저장' 버튼. 저장된 카드는 "저장됨" 상태와 노션 링크를 보여준다.
- 한국어 UI, 데스크톱·모바일 모두에서 읽기 쉬운 반응형 카드 레이아웃.

### Notion 저장
- 카드의 'Notion 저장' → 서버가 Notion MCP로 페이지 생성. 저장 내용: 한국어 제목, 요약, 카테고리, 출처, 원문 링크, 발행일.
- `notionPageUrl`이 이미 있으면 중복 저장하지 않는다. 성공/실패를 사용자에게 알린다.

## 완료 기준 (PRD 13절)
- 로그인하지 않으면 어떤 페이지/API도 접근할 수 없다.
- '뉴스 가져오기' 후 한국어 카드와 카테고리가 표시되고, 재실행해도 중복되지 않는다.
- 카테고리 추가/수정/삭제가 필터와 신규 분류에 반영된다.
- 'Notion 저장' 시 노션에 실제 페이지가 생성된다.
- 다른 계정으로 로그인하면 데이터가 분리되어 보인다.

## 미정 사항 (PRD 14절)

아래는 아직 결정되지 않았다. 구현 시 임의로 정하지 말고 사용자에게 확인한다.
- 노션 MCP 인증 방식(토큰/OAuth)과 저장 위치(데이터베이스 vs 부모 페이지)
- 피드당 가져올 기사 수 기본값
- 사용할 Claude 모델과 요약 길이(예: 2~3문장)
- 배포 대상(Vercel 등)

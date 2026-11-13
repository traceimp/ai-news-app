# UI 가이드

'AI 뉴스 수집기'의 화면 구성과 스타일 규칙을 정리한 문서다. 스타일은 **Tailwind CSS v4** 유틸리티 클래스로만 작성하고, 별도 CSS 파일은 `globals.css`의 디자인 토큰 외에는 추가하지 않는다. 제품 명세는 `PRD.md`, 구현 규칙은 `CLAUDE.md`를 따른다.

## 1. 디자인 원칙

- **깔끔함**: 장식을 줄이고 여백과 정렬로 구조를 드러낸다. 그림자는 약하게, 테두리는 얇게 쓴다.
- **읽기 편함**: 본문은 넉넉한 줄 간격과 충분한 대비를 유지한다. 한 줄이 너무 길어지지 않도록 콘텐츠 최대 너비를 제한한다.
- **한국어 우선**: 모든 UI 문구는 한국어. 한글이 어색하게 끊기지 않도록 제목·요약에 `break-keep`을 쓴다.
- **반응형**: 모바일(1열) → 태블릿(2열) → 데스크톱(3열) 순으로 확장한다. 모바일 기준으로 먼저 작성한다.
- **상태를 항상 보여준다**: 로딩, 빈 목록, 오류, 저장됨 상태를 모두 디자인한다.

## 2. 디자인 토큰

`src/app/globals.css`의 `:root` 변수와 `@theme inline`에 정의된 `background`, `foreground`를 기본으로 쓰고, 나머지는 Tailwind 기본 팔레트(`slate`, `indigo`)를 사용한다.

| 용도 | 라이트 | 다크 |
|---|---|---|
| 페이지 배경 | `bg-slate-50` | `dark:bg-neutral-950` |
| 카드/헤더 배경 | `bg-white` | `dark:bg-neutral-900` |
| 테두리 | `border-slate-200` | `dark:border-neutral-800` |
| 본문 텍스트 | `text-slate-700` | `dark:text-neutral-300` |
| 제목 텍스트 | `text-slate-900` | `dark:text-neutral-100` |
| 보조 텍스트(출처·날짜) | `text-slate-500` | `dark:text-neutral-400` |
| 강조(Primary) | `bg-indigo-600 hover:bg-indigo-700 text-white` | 동일 |

- 다크 모드는 기존 `prefers-color-scheme` 설정을 따르며, Tailwind의 `dark:` 변형으로 대응한다.
- 강조색은 인디고 하나만 쓴다. 버튼, 선택된 카테고리, 포커스 링에만 사용해 화면이 산만해지지 않게 한다.

### 타이포그래피

| 요소 | 클래스 |
|---|---|
| 앱 이름(헤더) | `text-lg font-bold tracking-tight` |
| 페이지 제목 | `text-2xl font-bold tracking-tight` (모바일 `text-xl`) |
| 카드 제목 | `text-base font-semibold leading-snug sm:text-lg` |
| 카드 요약 | `text-sm leading-relaxed` |
| 메타 정보 | `text-xs` |

- 현재 `globals.css`의 `body`가 `font-family: Arial`로 고정되어 Geist 변수가 적용되지 않는다. 한글이 잘 보이는 폰트(예: Pretendard)를 도입하거나 `font-sans`를 쓰도록 정리한다. 폰트를 바꿀 때는 사용자에게 먼저 확인한다.

## 3. 전체 레이아웃

```
┌──────────────────────────────────────────────┐
│ 헤더: AI 뉴스 수집기              [UserButton] │
├──────────────────────────────────────────────┤
│ 페이지 제목 / 설명           [뉴스 가져오기]    │
│                                              │
│ 카테고리: (전체) (모델/제품) (연구) … (+ 추가) │
│                                              │
│ ┌────────┐ ┌────────┐ ┌────────┐             │
│ │ 카드   │ │ 카드   │ │ 카드   │             │
│ └────────┘ └────────┘ └────────┘             │
└──────────────────────────────────────────────┘
```

- 콘텐츠 컨테이너: `mx-auto w-full max-w-6xl px-4 sm:px-6`
- 헤더는 `layout.tsx`에 있다. 하단 구분선을 두고 스크롤 시 상단에 고정한다: `sticky top-0 z-10 border-b bg-white/80 backdrop-blur dark:bg-neutral-900/80`
- 메인 영역: `flex-1 bg-slate-50 py-8 dark:bg-neutral-950`
- 섹션 간격은 `space-y-6` 또는 `gap-6`으로 통일한다.

## 4. 대시보드 (메인 화면)

### 4.1 페이지 머리말

- 왼쪽: 제목 "AI 뉴스" + 보조 설명 "해외 AI 뉴스를 한국어로 정리했어요"
- 오른쪽: **뉴스 가져오기** 버튼 (Primary). 모바일에서는 제목 아래로 내려가 전체 너비(`w-full sm:w-auto`)를 쓴다.
- 레이아웃: `flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between`

### 4.2 카테고리 바 (뉴스 카드 목록 바로 위)

카테고리를 가로로 나열하고, **맨 끝에 카테고리 추가 버튼**을 둔다.

```
(전체) (모델/제품) (연구) (투자·비즈니스) (규제·윤리) (미분류) (+ 카테고리 추가)
```

- 컨테이너: `flex flex-wrap items-center gap-2` — 화면이 좁으면 줄바꿈한다. (가로 스크롤 대신 줄바꿈으로 모든 항목이 보이게 한다.)
- 항목 순서: **전체 → 사용자 카테고리들 → 미분류 → 추가 버튼**. 추가 버튼은 항상 마지막이다.
- 카테고리 칩(알약형 버튼):
  - 기본: `rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800`
  - 선택됨: `border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-600` 그리고 `aria-pressed="true"`
  - 칩 안에 해당 카테고리 기사 수를 작게 덧붙일 수 있다(예: `연구 12`, `text-xs opacity-70`).
- **카테고리 색상**: 카테고리마다 서로 다른 색을 배정한다. 팔레트 10색(`src/lib/category-colors.ts`: sky, emerald, amber, rose, violet, orange, teal, fuchsia, lime, stone)에서 사용자가 쓰지 않는 색을 새 카테고리에 자동으로 고르고(`categories.color`에 키 저장), 10개를 넘으면 가장 적게 쓴 색을 재사용한다. 칩 앞에 색 점, 뉴스 카드의 카테고리 배지에 같은 색 톤을 쓴다. 인디고는 선택 상태 전용이라 팔레트에서 뺐고, 미분류는 회색(`slate`)이다.
- **카테고리 추가 버튼**:
  - 칩과 같은 크기이되 점선 테두리로 구분한다: `rounded-full border border-dashed border-slate-300 px-4 py-1.5 text-sm text-slate-500 hover:border-indigo-600 hover:text-indigo-600`
  - 문구는 `+ 카테고리 추가`. 아이콘만 쓰지 않고 텍스트를 함께 둔다.
  - 클릭하면 같은 자리에서 입력창으로 바뀐다(인라인 입력). 입력창 + `추가`/`취소` 버튼으로 구성하고 Enter로 확정, Esc로 취소한다. 모달은 쓰지 않는다.
  - 같은 이름이 이미 있으면 입력창 아래에 `text-xs text-red-600`로 "이미 있는 카테고리예요"를 표시한다.
- **이름 수정/삭제**: 사용자 카테고리 칩에 마우스를 올리면(모바일은 길게 누르기 또는 칩 옆 `⋯` 메뉴) 수정·삭제 메뉴가 나타난다. 삭제 전에는 "이 카테고리의 기사는 '미분류'로 이동합니다"를 확인 문구로 보여준다. '전체'와 '미분류'는 수정·삭제할 수 없다.

### 4.3 뉴스 카드 그리드

- 컨테이너: `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`
- 정렬: 최신 발행일순.
- 카테고리 칩을 선택하면 해당 카테고리 카드만 보여주고, '전체'는 모든 카드를 보여준다.
- **페이지 나누기**: 한 페이지에 카드 **9개**(3열 × 3줄). 주소는 `/dashboard?category=…&page=N`이고 1페이지는 `page`를 생략한다. 카테고리를 바꾸면 1페이지로 돌아가고, 페이지를 넘겨도 카테고리는 유지된다. 범위를 벗어난 `page` 값은 가장 가까운 유효한 페이지로 보정한다.
- 페이지 이동 UI(`Pagination`)는 카드 그리드 아래 가운데 정렬: `[처음][이전] 1 … 48 49 [50] 51 52 … 100 [다음][끝]`.
  - 첫/마지막 페이지는 항상 표시하고, 현재 페이지 앞뒤로 2페이지씩 표시한다.
  - 보이는 번호끼리 이어지지 않는 곳에만 `…`을 넣고, 이어지면 생략한다(예: 현재 3페이지면 `1 2 3 4 5 … 100`).
  - 1페이지에서는 `처음`/`이전`, 마지막 페이지에서는 `다음`/`끝`을 비활성 표시한다. 페이지가 1개뿐이면 전체를 숨긴다.
  - 현재 페이지는 인디고 채움 + `aria-current="page"`. 버튼 크기는 `h-10 min-w-10`(모바일 터치 영역 확보).

## 5. 뉴스 카드

### 5.1 구성 (위에서 아래 순서)

1. 상단 줄: **카테고리 배지**(왼쪽) · 출처 + 발행일(오른쪽)
2. **한국어 제목**
3. **한국어 요약** (3줄 말줄임: `line-clamp-3`)
4. 하단 줄: **원문 보기** 링크(왼쪽) · **Notion 저장** 버튼(오른쪽)

### 5.2 스타일

```tsx
<article className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
  <div className="flex items-center justify-between gap-2">
    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
      연구
    </span>
    <span className="text-xs text-slate-500 dark:text-neutral-400">
      TechCrunch · 2026.11.13
    </span>
  </div>
  <h3 className="break-keep text-base font-semibold leading-snug text-slate-900 sm:text-lg dark:text-neutral-100">
    한국어 제목
  </h3>
  <p className="line-clamp-3 break-keep text-sm leading-relaxed text-slate-700 dark:text-neutral-300">
    한국어 요약
  </p>
  <div className="mt-auto flex items-center justify-between pt-2">
    <a className="text-sm text-slate-500 underline-offset-4 hover:text-indigo-600 hover:underline" href="#">
      원문 보기 ↗
    </a>
    <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100">
      Notion 저장
    </button>
  </div>
</article>
```

- 카드 높이는 그리드 안에서 맞춰지도록 `flex flex-col` + 하단 줄에 `mt-auto`를 쓴다.
- 원문 링크는 `target="_blank" rel="noopener noreferrer"`로 연다.
- 카테고리 배지: 카테고리 색상 톤(4.2 참고), **미분류**는 `bg-slate-100 text-slate-600`으로 구분한다.
- 날짜는 `YYYY.MM.DD` 형식(한국어 로케일)으로 표시한다.

### 5.3 Notion 저장 상태

| 상태 | 표시 |
|---|---|
| 미저장 | `Notion 저장` 버튼 (테두리형) |
| 저장 중 | 버튼 비활성화 + 스피너 + `저장 중…` |
| 저장됨 | 초록 배지 `저장됨 ✓` + `Notion에서 보기 ↗` 링크 (`notionPageUrl`). 버튼은 숨겨 중복 저장을 막는다. |
| 실패 | 버튼 유지 + 카드 하단에 `text-xs text-red-600`로 실패 사유, 재시도 가능 |

- 저장됨 배지: `bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300`

## 6. 상태 화면

- **가져오기 진행 중**: 버튼이 `가져오는 중…`으로 바뀌고 비활성화된다. 목록 위에 진행 안내 줄을 띄운다.
- **가져오기 결과**: 완료 후 `신규 N건 · 건너뜀 N건 · 실패 N건`을 `rounded-lg bg-indigo-50 px-4 py-3 text-sm` 안내 박스로 보여준다. 실패가 있으면 해당 숫자를 `text-red-600`로 강조한다.
- **번역 전 카드**: `titleKo`가 없으면 원문 제목을 보여주고, 요약 자리에 `text-sm text-slate-500`로 "번역 대기 중"을 표시한다.
- **빈 목록**: 카드 영역 가운데에 "아직 가져온 뉴스가 없어요. '뉴스 가져오기'를 눌러보세요." (`py-16 text-center text-slate-500`)
- **필터 결과 없음**: "이 카테고리에는 뉴스가 없어요."
- **로딩 스켈레톤**: 카드 모양의 `animate-pulse` 블록(`bg-slate-200 dark:bg-neutral-800`)을 3개 보여준다.
- **오류**: 안내 박스에 `border-red-200 bg-red-50 text-red-700` 스타일을 쓰고 다시 시도 버튼을 둔다.

## 7. 공통 컴포넌트 규칙

### 버튼

| 종류 | 클래스 |
|---|---|
| Primary | `rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50` |
| Secondary | `rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-neutral-700 dark:hover:bg-neutral-800` |
| 위험(삭제) | `text-red-600 hover:bg-red-50` |

- 모든 버튼에 `cursor-pointer`와 `disabled:cursor-not-allowed`를 적용한다.
- 터치 영역은 모바일에서 최소 약 40px 높이(`py-2` 이상)를 확보한다.

### 입력창

`rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20`

### 접근성

- 포커스 가능한 요소에는 `focus-visible:ring-2 focus-visible:ring-indigo-600` 등 눈에 보이는 포커스 표시를 둔다.
- 카테고리 필터는 `aria-pressed`로 선택 상태를 알리고, 로딩·결과 안내에는 `aria-live="polite"`를 사용한다.
- 텍스트 대비는 WCAG AA(4.5:1) 이상을 유지한다. 보조 텍스트도 `slate-500`보다 연하게 쓰지 않는다.
- 아이콘만 있는 버튼에는 `aria-label`을 붙인다.

## 8. 구현 메모

- 화면은 서버 컴포넌트를 기본으로 하고, 카테고리 선택·인라인 입력·Notion 저장처럼 상호작용이 필요한 부분만 `"use client"` 컴포넌트로 분리한다.
- 컴포넌트 예시 구성: `CategoryBar`, `AddCategoryButton`(인라인 입력 포함), `NewsCard`, `NewsGrid`, `FetchNewsButton`, `FetchResultBanner`.
- 클래스가 길어지는 컴포넌트는 `NewsCard`처럼 컴포넌트 단위로 묶어 재사용하고, 같은 클래스 조합을 여러 곳에 복사하지 않는다.
- 새 UI를 추가하기 전에 이 문서의 토큰과 컴포넌트 규칙을 먼저 확인하고, 규칙이 바뀌면 이 문서를 함께 갱신한다.

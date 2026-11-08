import { config } from "dotenv";
config({ path: ".env.local" });

// 예제 데이터 입력/삭제 스크립트. 실제 사용자와 분리하기 위해 userId는 "sample-user"만 쓴다.
// 사용법: npx tsx scripts/seed-sample.ts [--clean]
const USER_ID = "sample-user";

const CATEGORY_NAMES = ["모델/제품", "연구", "투자·비즈니스", "규제·윤리"];

const SAMPLE_ARTICLES = [
  {
    source: "TechCrunch",
    originalUrl: "https://techcrunch.com/2026/11/06/sample-openai-mobile-reasoning-model/",
    originalTitle: "OpenAI unveils a lighter reasoning model for mobile apps",
    titleKo: "OpenAI, 모바일 앱용 경량 추론 모델 공개",
    summaryKo:
      "OpenAI가 스마트폰에서도 빠르게 동작하는 경량 추론 모델을 공개했다. 기존 모델보다 응답 속도가 빠르고 비용이 낮아 앱 개발자가 쓰기 쉽다. 다음 달부터 API로 제공된다.",
    category: "모델/제품",
    publishedAt: "2026-11-06T09:00:00Z",
    notionPageUrl: null,
  },
  {
    source: "The Verge",
    originalUrl: "https://www.theverge.com/2026/11/5/sample-google-search-agent-mode",
    originalTitle: "Google adds agent mode to its search app",
    titleKo: "구글, 검색 앱에 에이전트 모드 추가",
    summaryKo:
      "구글이 검색 앱에 예약, 비교, 구매 같은 작업을 대신 처리하는 에이전트 모드를 넣었다. 사용자는 목적만 입력하면 되고 최종 결제 전에는 확인을 거친다. 미국에서 먼저 시작한다.",
    category: "모델/제품",
    publishedAt: "2026-11-05T09:00:00Z",
    notionPageUrl: null,
  },
  {
    source: "TechCrunch",
    originalUrl: "https://techcrunch.com/2026/11/04/sample-ai-chip-startup-raises-400m/",
    originalTitle: "AI chip startup raises $400M to challenge Nvidia",
    titleKo: "AI 칩 스타트업, 엔비디아에 도전하며 4억 달러 투자 유치",
    summaryKo:
      "한 AI 칩 스타트업이 4억 달러 규모의 투자를 받았다. 추론 전용 칩으로 전력 효율을 높였다고 주장한다. 투자금은 양산과 데이터센터 고객 확보에 쓸 계획이다.",
    category: "투자·비즈니스",
    publishedAt: "2026-11-04T09:00:00Z",
    notionPageUrl: null,
  },
  {
    source: "The Verge",
    originalUrl: "https://www.theverge.com/2026/11/3/sample-eu-ai-content-labeling-rules",
    originalTitle: "EU finalizes labeling rules for AI-generated content",
    titleKo: "EU, AI 생성 콘텐츠 표시 규정 확정",
    summaryKo:
      "EU가 AI로 만든 이미지, 영상, 음성에 표시를 의무화하는 규정을 확정했다. 위반하면 매출의 일정 비율을 과징금으로 낸다. 시행은 내년 하반기부터다.",
    category: "규제·윤리",
    publishedAt: "2026-11-03T09:00:00Z",
    notionPageUrl: null,
  },
  {
    source: "TechCrunch",
    originalUrl: "https://techcrunch.com/2026/11/01/sample-smaller-models-new-training-method/",
    originalTitle:
      "Researchers show smaller models can match larger ones with new training method",
    titleKo: "연구진, 새 학습법으로 소형 모델이 대형 모델 성능 따라잡는다고 발표",
    summaryKo:
      "연구진이 데이터 선별과 단계별 증류를 결합한 학습법을 공개했다. 파라미터가 10분의 1인 모델이 여러 벤치마크에서 대형 모델과 비슷한 점수를 냈다. 다만 일부 추론 과제에서는 차이가 남았다.",
    category: "연구",
    publishedAt: "2026-11-01T09:00:00Z",
    notionPageUrl: "https://www.notion.so/sample-page-0001",
  },
];

async function main() {
  const { db } = await import("../src/db");
  const { articles, categories } = await import("../src/db/schema");
  const { eq, and } = await import("drizzle-orm");

  if (process.argv.includes("--clean")) {
    // 기사를 먼저 지우고 카테고리를 지운다.
    const a = await db.delete(articles).where(eq(articles.userId, USER_ID)).returning({ id: articles.id });
    const c = await db.delete(categories).where(eq(categories.userId, USER_ID)).returning({ id: categories.id });
    console.log(`삭제: 기사 ${a.length}건, 카테고리 ${c.length}건`);
    process.exit(0);
  }

  await db
    .insert(categories)
    .values(CATEGORY_NAMES.map((name) => ({ userId: USER_ID, name })))
    .onConflictDoNothing();

  const cats = await db.select().from(categories).where(eq(categories.userId, USER_ID));
  const idByName = new Map(cats.map((c) => [c.name, c.id]));

  const inserted = await db
    .insert(articles)
    .values(
      SAMPLE_ARTICLES.map(({ category, publishedAt, ...rest }) => ({
        ...rest,
        userId: USER_ID,
        categoryId: idByName.get(category) ?? null,
        publishedAt: new Date(publishedAt),
      })),
    )
    .onConflictDoNothing()
    .returning({ id: articles.id });

  console.log(`카테고리 ${cats.length}건 확인, 기사 신규 ${inserted.length}건 / 건너뜀 ${SAMPLE_ARTICLES.length - inserted.length}건`);
  const total = await db.select().from(articles).where(and(eq(articles.userId, USER_ID)));
  console.log(`sample-user 기사 총 ${total.length}건`);
  process.exit(0);
}

main().catch((e) => {
  console.error("FAIL", e);
  process.exit(1);
});

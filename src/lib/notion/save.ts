import "server-only";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export class MissingNotionConfigError extends Error {
  constructor() {
    super("NOTION_API_TOKEN 또는 NOTION_DATABASE_ID가 설정되지 않았어요.");
  }
}

export type NotionArticle = {
  titleKo: string;
  summaryKo: string;
  categoryName: string | null;
  source: string;
  originalUrl: string;
  publishedAt: Date | null;
};

// Notion 제한: rich text 한 덩어리는 2000자, select 옵션 이름에는 쉼표를 쓸 수 없다.
const text = (value: string, max = 2000) => [{ text: { content: value.slice(0, max) } }];
const selectName = (value: string) => value.replace(/,/g, " ").trim().slice(0, 100);

// Notion MCP 서버(@notionhq/notion-mcp-server)를 자식 프로세스로 띄워 MCP 클라이언트로 연결하고
// 데이터베이스에 페이지를 만든다. 토큰은 서버 프로세스 환경변수로만 전달한다.
export async function createNotionPage(article: NotionArticle): Promise<string> {
  const token = process.env.NOTION_API_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) throw new MissingNotionConfigError();

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(process.cwd(), "node_modules/@notionhq/notion-mcp-server/bin/cli.mjs")],
    env: { PATH: process.env.PATH ?? "", NOTION_TOKEN: token },
    stderr: "ignore",
  });
  const client = new Client({ name: "ai-news-collector", version: "0.1.0" });

  try {
    await client.connect(transport);

    const properties: Record<string, unknown> = {
      제목: { title: text(article.titleKo, 200) },
      요약: { rich_text: text(article.summaryKo) },
      출처: { select: { name: selectName(article.source) } },
      "원문 링크": { url: article.originalUrl },
    };
    if (article.categoryName) {
      properties["카테고리"] = { select: { name: selectName(article.categoryName) } };
    }
    if (article.publishedAt) {
      properties["발행일"] = { date: { start: article.publishedAt.toISOString() } };
    }

    const result = await client.callTool({
      name: "API-post-page",
      arguments: { parent: { database_id: databaseId }, properties },
    });

    const content = result.content as { type: string; text?: string }[];
    const body = content.find((c) => c.type === "text")?.text ?? "";
    if (result.isError) throw new Error(`Notion MCP 오류: ${body.slice(0, 300)}`);

    const url = (JSON.parse(body) as { url?: string }).url;
    if (!url) throw new Error("Notion 응답에 페이지 URL이 없어요.");
    return url;
  } finally {
    await client.close().catch(() => {});
  }
}

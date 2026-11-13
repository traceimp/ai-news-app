import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// 번역·요약·분류용 모델. 단순 작업이라 가장 가벼운 Haiku를 쓴다.
export const PROCESSING_MODEL = "claude-haiku-5-5";

export class MissingApiKeyError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY가 설정되지 않았어요.");
    this.name = "MissingApiKeyError";
  }
}

let cached: Anthropic | null = null;

// 키는 서버 환경변수에서만 읽는다. 없으면 호출 전에 명확하게 실패시킨다.
export function getAnthropic(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new MissingApiKeyError();
  cached ??= new Anthropic({ apiKey });
  return cached;
}

import { createOpenAI } from "@ai-sdk/openai";
import { getServerEnv } from "@/lib/env";

export function getOpenAI() {
  const { OPENAI_API_KEY } = getServerEnv();
  return createOpenAI({ apiKey: OPENAI_API_KEY });
}

export function getChatModel() {
  const openai = getOpenAI();
  const { CHAT_MODEL } = getServerEnv();
  return openai(CHAT_MODEL);
}

export function getEmbeddingModel() {
  const openai = getOpenAI();
  return openai.embedding("text-embedding-3-small");
}

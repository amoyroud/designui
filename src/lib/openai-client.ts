import OpenAI from "openai";

let cachedClient: OpenAI | null = null;

export const DEFAULT_MODELS = {
  text: process.env.OPENAI_GUIDELINE_MODEL ?? "gpt-4o-mini",
  embedding: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-large",
};

export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getOpenAIClient(): OpenAI | null {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}


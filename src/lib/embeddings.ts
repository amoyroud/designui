import { createHash } from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { DEFAULT_MODELS, getOpenAIClient } from "@/lib/openai-client";
import type { EmbeddingDescriptor } from "@/lib/types";

const DEFAULT_EMBEDDING_MODEL = DEFAULT_MODELS.embedding;

function buildFallbackEmbedding(text: string, dimensionality = 64): EmbeddingDescriptor {
  const hash = createHash("sha256").update(text).digest();
  const vector: number[] = [];

  for (let index = 0; index < dimensionality; index += 1) {
    const byte = hash[index % hash.length];
    const normalized = (byte / 255) * 2 - 1; // Scale to [-1, 1]
    vector.push(Number(normalized.toFixed(6)));
  }

  return {
    model: "hash-fallback",
    vector,
    dimensionality,
  } satisfies EmbeddingDescriptor;
}

export async function generateSemanticEmbedding(text: string): Promise<EmbeddingDescriptor> {
  const normalized = text.trim().slice(0, 8000) || "neutral aesthetic";
  const client = getOpenAIClient();

  if (!client) {
    return buildFallbackEmbedding(normalized);
  }

  try {
    const response = await client.embeddings.create({
      model: DEFAULT_EMBEDDING_MODEL,
      input: normalized,
    });

    const payload = response.data[0];

    return {
      model: response.model ?? DEFAULT_EMBEDDING_MODEL,
      vector: payload.embedding,
      dimensionality: payload.embedding.length,
    } satisfies EmbeddingDescriptor;
  } catch (error) {
    console.error("Embedding generation failed", error);
    return buildFallbackEmbedding(normalized);
  }
}

export async function persistEmbedding(
  inspirationId: string,
  embedding: EmbeddingDescriptor,
  descriptors: Record<string, unknown>,
) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("inspiration_features").upsert(
    {
      inspiration_id: inspirationId,
      embedding_model: embedding.model,
      embedding: embedding.vector,
      descriptors,
    },
    { onConflict: "inspiration_id" },
  );

  if (error) {
    console.error("Failed to persist embedding", error);
  }
}


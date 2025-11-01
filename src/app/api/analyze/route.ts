import { NextResponse } from "next/server";
import { analyzeImageBuffer } from "@/lib/extractors/image";
import { analyzeUrlForStyle } from "@/lib/extractors/url";
import { generateSemanticEmbedding, persistEmbedding } from "@/lib/embeddings";
import { buildClustersFromAnalyses } from "@/lib/analysis";
import { generateGuidelineWithLLM } from "@/lib/openai";
import { getSupabaseAdminClient, getSupabaseBucketName } from "@/lib/supabase";
import { getDevInspirationRecords } from "@/lib/dev-store";
import type {
  AnalysisResult,
  InspirationAnalysis,
  SupabaseInspirationRecord,
} from "@/types/aesthetic";

export const runtime = "nodejs";

type AnalyzeRequestDto = {
  inspirationIds?: string[];
  imageIds?: string[];
};

type ResolvedInspirationRecord = SupabaseInspirationRecord & {
  binary?: Uint8Array;
  preview_url?: string | null;
};

async function fetchInspirationRecords(
  ids: string[],
): Promise<{ records: ResolvedInspirationRecord[]; supabaseBucket?: string | null }> {
  const supabase = getSupabaseAdminClient();
  const bucket = supabase ? getSupabaseBucketName() : null;

  if (!supabase) {
    const localRecords = getDevInspirationRecords(ids);

    return {
      records: localRecords,
      supabaseBucket: null,
    };
  }

  const { data, error } = await supabase
    .from("inspirations")
    .select("*")
    .in("id", ids)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load inspirations", error);
    throw new Error("Unable to load inspirations");
  }

  const recordMap = new Map(data?.map((record) => [record.id, record]));
  const orderedRecords: ResolvedInspirationRecord[] = ids
    .map((id) => recordMap.get(id))
    .filter((record): record is SupabaseInspirationRecord => Boolean(record));

  return {
    records: orderedRecords,
    supabaseBucket: bucket,
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as AnalyzeRequestDto;
  const inspirationIds = body.inspirationIds ?? body.imageIds ?? [];

  if (!inspirationIds.length) {
    return NextResponse.json({ message: "No inspirations provided" }, { status: 400 });
  }

  let records: ResolvedInspirationRecord[] = [];
  let bucketName: string | null | undefined = null;

  try {
    const payload = await fetchInspirationRecords(inspirationIds);
    records = payload.records;
    bucketName = payload.supabaseBucket ?? null;
  } catch (error) {
    console.error("Analysis bootstrap failed", error);
    return NextResponse.json({ message: "Failed to load inspirations" }, { status: 500 });
  }

  if (!records.length) {
    return NextResponse.json({ message: "No inspirations found" }, { status: 404 });
  }

  const supabase = getSupabaseAdminClient();
  const analyses: InspirationAnalysis[] = [];

  for (const record of records) {
    if (record.kind === "image") {
      let buffer: ArrayBuffer | Uint8Array | null = null;

      if (record.binary) {
        buffer = record.binary;
      } else if (supabase && bucketName && record.storage_path) {
        const download = await supabase.storage.from(bucketName).download(record.storage_path);
        if (download.error) {
          console.error("Failed to download inspiration asset", download.error);
        } else {
          buffer = await download.data.arrayBuffer();
        }
      }

      const byteLength = buffer instanceof Uint8Array ? buffer.byteLength : buffer?.byteLength ?? 0;

      if (!buffer || byteLength === 0) {
        console.warn("No binary payload for inspiration; falling back to defaults", {
          inspirationId: record.id,
          storagePath: record.storage_path,
        });
      }

      const imageResult = await analyzeImageBuffer(buffer ?? new Uint8Array());
      const descriptorRecord = {
        summary: imageResult.essence.summary,
        mood: imageResult.essence.moodKeywords,
        palette: imageResult.palette,
        tags: imageResult.tags,
      };
      const embedding = await generateSemanticEmbedding(
        `${imageResult.essence.summary}. Tags: ${imageResult.tags.join(", ")}. Palette: ${imageResult.palette
          .slice(0, 3)
          .map((swatch) => swatch.hex)
          .join(", ")}`,
      );

      await persistEmbedding(record.id, embedding, descriptorRecord);

      analyses.push({
        inspirationId: record.id,
        kind: "image",
        source: record.storage_path || record.original_name || record.id,
        previewUrl: record.preview_url ?? undefined,
        dominantColors: imageResult.palette,
        fontCandidates: [],
        descriptors: imageResult.essence,
        tags: imageResult.tags,
        embedding,
      });
    } else {
      const targetUrl = record.source_url ?? record.preview_url ?? "";
      const urlResult = await analyzeUrlForStyle(targetUrl || "https://example.com");
      const descriptorRecord = {
        summary: urlResult.essence.summary,
        mood: urlResult.essence.moodKeywords,
        palette: urlResult.palette,
        fonts: urlResult.fonts,
        tags: urlResult.tags,
      };
      const embedding = await generateSemanticEmbedding(
        `${urlResult.essence.summary}. Fonts: ${urlResult.fonts
          .map((font) => font.family)
          .join(", ")}. Palette: ${urlResult.palette.map((swatch) => swatch.hex).join(", ")}`,
      );

      await persistEmbedding(record.id, embedding, descriptorRecord);

      analyses.push({
        inspirationId: record.id,
        kind: "url",
        source: targetUrl || record.original_name || record.id,
        previewUrl: targetUrl,
        dominantColors: urlResult.palette,
        fontCandidates: urlResult.fonts,
        descriptors: urlResult.essence,
        tags: urlResult.tags,
        embedding,
      });
    }
  }

  const clusters = buildClustersFromAnalyses(analyses);
  const guidelinePayload = await generateGuidelineWithLLM(analyses, clusters);

  const payload: AnalysisResult = {
    inspirations: analyses,
    clusters,
    guideline: guidelinePayload.guideline,
    synthesis: guidelinePayload.summary,
  };

  return NextResponse.json(payload, { status: 200 });
}


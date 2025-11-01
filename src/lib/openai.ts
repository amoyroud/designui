import { DEFAULT_MODELS, getOpenAIClient, hasOpenAIKey } from "@/lib/openai-client";
import { buildGuidelineDetail, buildGuidelineSummary } from "@/lib/analysis";
import type {
  BrandGuideline,
  BrandGuidelineSummary,
  ClusterSummary,
  InspirationAnalysis,
} from "@/lib/types";

type LlmGuidelineResponse = {
  summary: BrandGuidelineSummary;
  guideline: BrandGuideline;
};

const swatchSchema = {
  type: "object",
  properties: {
    hex: { type: "string" },
    usage: { type: "string", nullable: true },
    name: { type: "string", nullable: true },
  },
  required: ["hex"],
};

const fontSchema = {
  type: "object",
  properties: {
    family: { type: "string" },
    category: { type: "string" },
    source: { type: "string", nullable: true },
    usage: { type: "string", nullable: true },
    fallbackStack: { type: "string", nullable: true },
  },
  required: ["family", "category"],
};

const guidelineSchema = {
  name: "ReverseMoodboardGuideline",
  schema: {
    type: "object",
    properties: {
      summary: {
        type: "object",
        properties: {
          palette: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
          fontDirection: { type: "string" },
          mood: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
          keywords: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 12 },
          narrative: { type: "string" },
        },
        required: ["palette", "fontDirection", "mood", "keywords", "narrative"],
      },
      guideline: {
        type: "object",
        properties: {
          palette: {
            type: "object",
            properties: {
              primary: { type: "array", items: swatchSchema, minItems: 1 },
              secondary: { type: "array", items: swatchSchema },
              neutrals: { type: "array", items: swatchSchema },
              accents: { type: "array", items: swatchSchema },
            },
            required: ["primary", "secondary", "neutrals", "accents"],
          },
          typography: {
            type: "object",
            properties: {
              primary: fontSchema,
              secondary: { ...fontSchema, nullable: true },
              accent: { ...fontSchema, nullable: true },
              code: { ...fontSchema, nullable: true },
            },
            required: ["primary"],
          },
          imagery: {
            type: "object",
            properties: {
              direction: { type: "string" },
              treatments: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
              lighting: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 3 },
              composition: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 3 },
              textureNotes: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 3 },
            },
            required: ["direction", "treatments", "lighting", "composition", "textureNotes"],
          },
          tone: {
            type: "object",
            properties: {
              voice: { type: "string" },
              adjectives: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
              messagingPillars: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
            },
            required: ["voice", "adjectives", "messagingPillars"],
          },
          keywords: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 12 },
          summary: { type: "string" },
        },
        required: ["palette", "typography", "imagery", "tone", "keywords", "summary"],
      },
    },
    required: ["summary", "guideline"],
  },
} as const;

const designContext = {
  principles: ["Calm minimalism", "Focus on content", "Tactile interactions"],
  palette: {
    canvas: "#FAF7F2",
    surface: "#F0ECE6",
    neutral: "#D5D0C7",
    textPrimary: "#2F2F2F",
    textSecondary: "#5C5C5C",
    accent: "#8A7E6A",
  },
  typography: {
    primary: "Geist Sans",
    secondary: "Geist Mono (sparingly)",
  },
  tone: "Warm, composed, and textural.",
};

function condenseAnalyses(analyses: InspirationAnalysis[]) {
  return analyses.map((analysis) => ({
    id: analysis.inspirationId,
    kind: analysis.kind,
    source: analysis.source,
    colors: analysis.dominantColors.map((swatch) => swatch.hex),
    fonts: analysis.fontCandidates.map((font) => ({
      family: font.family,
      category: font.category,
      usage: font.usage,
    })),
    summary: analysis.descriptors.summary,
    mood: analysis.descriptors.moodKeywords,
    textures: analysis.descriptors.textures,
    keywords: analysis.tags,
  }));
}

function condenseClusters(clusters: ClusterSummary[]) {
  return clusters.map((cluster) => ({
    id: cluster.clusterId,
    palette: cluster.palette.map((swatch) => swatch.hex),
    fonts: cluster.fontThemes.map((font) => font.family),
    mood: cluster.mood,
    keywords: cluster.keywords,
    narrative: cluster.narrative,
  }));
}

function withFallback(analyses: InspirationAnalysis[]): LlmGuidelineResponse {
  return {
    summary: buildGuidelineSummary(analyses),
    guideline: buildGuidelineDetail(analyses),
  };
}

export async function generateGuidelineWithLLM(
  analyses: InspirationAnalysis[],
  clusters: ClusterSummary[],
): Promise<LlmGuidelineResponse> {
  if (!hasOpenAIKey()) {
    return withFallback(analyses);
  }

  const client = getOpenAIClient();
  if (!client) {
    return withFallback(analyses);
  }

  const payload = {
    designContext,
    inspirations: condenseAnalyses(analyses),
    clusters: condenseClusters(clusters),
  };

  try {
    const response = await client.responses.create({
      model: DEFAULT_MODELS.text,
      response_format: {
        type: "json_schema",
        json_schema: guidelineSchema,
      },
      input: [
        {
          role: "system",
          content:
            "You are a senior brand strategist and design systems expert. Generate a brand guideline that aligns with the provided design context. Respect the calm minimalism principles, honor accessible contrast, and keep tone warm, composed, and textural. Use only hex codes provided or harmonious adjacent neutrals.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: JSON.stringify(payload),
            },
          ],
        },
      ],
    });

    const output = response.output_text;
    if (!output) {
      throw new Error("OpenAI response missing text");
    }

    const parsed = JSON.parse(output) as LlmGuidelineResponse;
    return parsed;
  } catch (error) {
    console.error("Guideline synthesis failed", error);
    return withFallback(analyses);
  }
}


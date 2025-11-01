import { DEFAULT_MODELS, getOpenAIClient, hasOpenAIKey } from "@/lib/openai-client";
import { buildGuidelineDetail, buildGuidelineSummary } from "@/lib/analysis";
import type {
  BrandGuideline,
  BrandGuidelineSummary,
  ClusterSummary,
  DesignDirection,
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
              type: "input_text",
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

const designDirectionSchema = {
  name: "DesignDirections",
  schema: {
    type: "object",
    properties: {
      directions: {
        type: "array",
        minItems: 2,
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            concept: { type: "string" },
            tagline: { type: "string" },
            description: { type: "string" },
            reasoning: { type: "string" },
            colorApplication: {
              type: "object",
              properties: {
                hero: { type: "string" },
                background: { type: "string" },
                accent: { type: "string" },
                text: { type: "string" },
              },
              required: ["hero", "background", "accent", "text"],
            },
            typographyApplication: {
              type: "object",
              properties: {
                headline: fontSchema,
                body: fontSchema,
                hierarchy: { type: "string" },
              },
              required: ["headline", "body", "hierarchy"],
            },
            heroSection: {
              type: "object",
              properties: {
                headline: { type: "string" },
                subheadline: { type: "string" },
                ctaText: { type: "string" },
                visualTreatment: { type: "string" },
              },
              required: ["headline", "subheadline", "ctaText", "visualTreatment"],
            },
            layoutStyle: { type: "string" },
            keyFeatures: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
            ctaStrategy: {
              type: "object",
              properties: {
                style: { type: "string" },
                placement: { type: "string" },
                tone: { type: "string" },
              },
              required: ["style", "placement", "tone"],
            },
          },
          required: [
            "id",
            "concept",
            "tagline",
            "description",
            "reasoning",
            "colorApplication",
            "typographyApplication",
            "heroSection",
            "layoutStyle",
            "keyFeatures",
            "ctaStrategy",
          ],
        },
      },
    },
    required: ["directions"],
  },
} as const;

export async function generateDesignDirections(
  guideline: BrandGuideline,
  synthesis: BrandGuidelineSummary,
  projectContext: string,
  analyses: InspirationAnalysis[],
): Promise<DesignDirection[]> {
  if (!hasOpenAIKey()) {
    return [];
  }

  const client = getOpenAIClient();
  if (!client) {
    return [];
  }

  const payload = {
    projectContext,
    brandGuideline: {
      palette: guideline.palette,
      typography: guideline.typography,
      mood: synthesis.mood,
      keywords: synthesis.keywords,
      narrative: synthesis.narrative,
    },
    visualAnalysis: {
      dominantColors: analyses.flatMap((a) => a.dominantColors.slice(0, 3).map((c) => c.hex)),
      fonts: analyses.flatMap((a) => a.fontCandidates.map((f) => ({ family: f.family, category: f.category }))),
      moodKeywords: analyses.flatMap((a) => a.descriptors.moodKeywords),
    },
  };

  const systemPrompt = `You are a senior web designer and brand strategist. Given:
1. A project/product description from the user
2. Brand guidelines (colors, typography, mood) extracted from their visual inspirations

Generate 2-3 distinct design directions for their landing page. Each direction should:
- Have a clear, memorable concept name (e.g., "Minimalist Professional", "Bold & Energetic")
- Use the extracted brand colors differently to create distinct personalities
- Apply typography in unique ways that fit the concept
- Include a complete hero section with headline, subheadline, and CTA
- Explain WHY this direction works for their specific product/audience
- Be production-ready with specific hex codes and font applications

Make each direction feel distinct but rooted in their visual DNA. Consider their target audience and product positioning.`;

  try {
    const response = await client.responses.create({
      model: DEFAULT_MODELS.text,
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
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

    const parsed = JSON.parse(output) as { directions: DesignDirection[] };
    return parsed.directions;
  } catch (error) {
    console.error("Design direction generation failed", error);
    return [];
  }
}


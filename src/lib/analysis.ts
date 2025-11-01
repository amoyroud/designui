import type {
  BrandGuideline,
  BrandGuidelineSummary,
  ClusterSummary,
  ColorSwatch,
  FontCandidate,
  InspirationAnalysis,
} from "@/lib/types";

function dedupe<T>(values: T[]) {
  return Array.from(new Set(values));
}

function rankColors(analyses: InspirationAnalysis[]): string[] {
  const colors: string[] = [];
  analyses.forEach((analysis) => {
    analysis.dominantColors.forEach((swatch) => {
      if (!colors.includes(swatch.hex)) {
        colors.push(swatch.hex);
      }
    });
  });
  return colors.slice(0, 8);
}

function rankFonts(analyses: InspirationAnalysis[]): FontCandidate[] {
  const fonts: FontCandidate[] = [];
  analyses.forEach((analysis) => {
    analysis.fontCandidates.forEach((font) => {
      if (!fonts.find((entry) => entry.family === font.family)) {
        fonts.push(font);
      }
    });
  });
  return fonts;
}

function summarizeKeywords(analyses: InspirationAnalysis[]): string[] {
  const keywords = analyses.flatMap((analysis) => analysis.tags);
  return dedupe(keywords).slice(0, 10);
}

export function buildClustersFromAnalyses(analyses: InspirationAnalysis[]): ClusterSummary[] {
  if (!analyses.length) {
    return [];
  }

  const groups = new Map<string, InspirationAnalysis[]>();

  analyses.forEach((analysis) => {
    const key = analysis.dominantColors[0]?.hex?.slice(1, 3) ?? "default";
    const bucket = groups.get(key) ?? [];
    bucket.push(analysis);
    groups.set(key, bucket);
  });

  let index = 0;
  const clusters: ClusterSummary[] = [];

  groups.forEach((group) => {
    index += 1;
    const clusterPalette: ColorSwatch[] = [];
    group.forEach((analysis) => {
      analysis.dominantColors.slice(0, 2).forEach((swatch) => {
        if (!clusterPalette.find((entry) => entry.hex === swatch.hex)) {
          clusterPalette.push(swatch);
        }
      });
    });

    const fonts = rankFonts(group);
    const mood = dedupe(group.flatMap((analysis) => analysis.descriptors.moodKeywords)).slice(0, 4);
    const keywords = summarizeKeywords(group).slice(0, 6);

    clusters.push({
      clusterId: `cluster-${index}`,
      label: `Aesthetic vein ${index}`,
      members: group.map((entry) => entry.inspirationId),
      narrative: `${clusterPalette[0]?.hex ?? "#F8F1E8"} driven aesthetic with ${fonts[0]?.family ?? "sans-serif"} typography`,
      palette: clusterPalette.slice(0, 5),
      fontThemes: fonts.slice(0, 3),
      mood,
      keywords,
    });
  });

  return clusters;
}

export function buildGuidelineSummary(analyses: InspirationAnalysis[]): BrandGuidelineSummary {
  const colors = rankColors(analyses);
  const fonts = rankFonts(analyses);
  const keywords = summarizeKeywords(analyses);
  const mood = dedupe(analyses.flatMap((analysis) => analysis.descriptors.moodKeywords)).slice(0, 5);

  const narrative = `Common aesthetic threads: ${keywords.slice(0, 3).join(", ")}. Typography leans ${fonts[0]?.family ?? "modern sans"}, with palette anchored in ${colors[0] ?? "#F8F1E8"}.`;

  return {
    palette: colors.slice(0, 5),
    fontDirection: fonts.map((font) => font.family).slice(0, 2).join(" / ") || "Calm geometric sans",
    mood,
    keywords,
    narrative,
  } satisfies BrandGuidelineSummary;
}

export function buildGuidelineDetail(analyses: InspirationAnalysis[]): BrandGuideline {
  const colors = rankColors(analyses);
  const fonts = rankFonts(analyses);
  const keywords = summarizeKeywords(analyses);
  const primaryFont = fonts[0] ?? {
    family: "Inter",
    category: "sans-serif",
    source: "unknown",
    usage: "Primary",
  };

  const secondaryFont = fonts[1] ?? {
    family: "DM Serif Display",
    category: "serif",
    source: "unknown",
    usage: "Accent",
  };

  return {
    palette: {
      primary: colors.slice(0, 2).map((hex) => ({ hex, usage: "primary" })),
      secondary: colors.slice(2, 4).map((hex) => ({ hex, usage: "secondary" })),
      neutrals: colors.slice(4, 6).map((hex) => ({ hex, usage: "neutral" })),
      accents: colors.slice(6, 8).map((hex) => ({ hex, usage: "accent" })),
    },
    typography: {
      primary: primaryFont,
      secondary: secondaryFont,
      accent: fonts[2],
      code: {
        family: "IBM Plex Mono",
        category: "mono",
        source: "unknown",
        usage: "Code",
      },
    },
    imagery: {
      direction: "Shoot with diffused natural light and tactile surfaces",
      treatments: ["Soft gradients", "Organic cropping"],
      lighting: ["Diffuse", "Low contrast"],
      composition: ["Centered", "Grid-aligned"],
      textureNotes: ["Soft grain", "Matte finishes"],
    },
    tone: {
      voice: "Quiet confidence with curated warmth",
      adjectives: ["Warm", "Intentional", "Tactile"],
      messagingPillars: ["Craft", "Calm", "Clarity"],
    },
    keywords,
    summary: `Blend ${primaryFont.family} typography with ${colors[0] ?? "#F8F1E8"} anchored palette for a composed, tactile brand feel.`,
  } satisfies BrandGuideline;
}


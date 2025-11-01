import sharp from "sharp";
import { derivePaletteFromDominant, sortPaletteByLuminance } from "@/lib/extractors/colors";
import type { ColorSwatch, ImageEssence } from "@/lib/types";

export type ImageExtractionResult = {
  palette: ColorSwatch[];
  essence: ImageEssence;
  tags: string[];
};

type SharpStats = Awaited<ReturnType<sharp.Sharp["stats"]>>;

function fallbackPalette(): ColorSwatch[] {
  return [
    { hex: "#F8F1E8", usage: "primary" },
    { hex: "#D6C8BB", usage: "neutral" },
    { hex: "#A5907A", usage: "secondary" },
    { hex: "#5E5548", usage: "accent" },
    { hex: "#332E2A", usage: "supporting" },
  ];
}

function buildEssenceFromStats(stats: SharpStats | undefined): ImageEssence {
  if (!stats) {
    return {
      summary: "Soft neutral palette with gentle tonal contrast.",
      moodKeywords: ["Calm", "Curated", "Soft"],
      textures: ["Gentle grain"],
      lighting: ["Diffused"],
      composition: ["Centered"],
    };
  }

  const means = stats.channels?.map((channel) => channel.mean) ?? [];
  const averageLuminance = means.length
    ? means.reduce((sum, value) => sum + value, 0) / (means.length * 255)
    : 0.5;
  const contrast = stats.channels?.reduce((acc, channel) => Math.max(acc, channel.stdDev), 0) ?? 30;

  const mood: string[] = [];
  if (averageLuminance > 0.7) {
    mood.push("Airy", "Optimistic");
  } else if (averageLuminance > 0.45) {
    mood.push("Calm", "Balanced");
  } else {
    mood.push("Moody", "Analogue");
  }

  if (contrast > 60) {
    mood.push("Graphic");
  } else {
    mood.push("Soft");
  }

  const textures = contrast > 50 ? ["High contrast", "Defined edges"] : ["Soft gradients", "Textural wash"];
  const lighting = averageLuminance > 0.65 ? ["Bright", "Diffuse"] : ["Dim", "Directional"];
  const composition = stats.entropy > 4 ? ["Layered", "Dynamic"] : ["Minimal", "Centered"];

  const summary = `Palette leans ${averageLuminance > 0.55 ? "light" : "deep"} with ${contrast > 55 ? "punchy" : "subtle"} contrast.`;

  return {
    summary,
    moodKeywords: mood,
    textures,
    lighting,
    composition,
  };
}

function fallbackExtraction(): ImageExtractionResult {
  return {
    palette: fallbackPalette(),
    essence: {
      summary: "Warm neutral palette with tactile softness.",
      moodKeywords: ["Warm", "Intentional", "Tactile"],
      textures: ["Soft grain"],
      lighting: ["Diffuse"],
      composition: ["Centered"],
    },
    tags: ["warm", "neutral", "tactile"],
  };
}

export async function analyzeImageBuffer(buffer: ArrayBuffer | Uint8Array): Promise<ImageExtractionResult> {
  try {
    const byteView = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer ?? new ArrayBuffer(0));

    if (byteView.byteLength === 0) {
      console.warn("Image analyzer received empty buffer; returning fallback palette.");
      return fallbackExtraction();
    }

    const image = sharp(byteView, { failOn: "none" });
    const stats = await image.stats();
    const dominant = stats.dominant ?? { r: 248, g: 241, b: 232 };
    const palette = sortPaletteByLuminance(derivePaletteFromDominant(dominant));
    const essence = buildEssenceFromStats(stats);

    const tags = [
      essence.moodKeywords[0] ?? "calm",
      essence.textures[0] ?? "textural",
      palette[0]?.hex ?? "#F8F1E8",
    ];

    return {
      palette,
      essence,
      tags,
    };
  } catch (error) {
    console.error("Image analysis failed, falling back to defaults", error);

    return fallbackExtraction();
  }
}


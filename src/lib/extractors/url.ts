import { load } from "cheerio";
import type { ColorSwatch, FontCandidate, ImageEssence } from "@/lib/types";

export type UrlExtractionResult = {
  palette: ColorSwatch[];
  fonts: FontCandidate[];
  essence: ImageEssence;
  tags: string[];
};

const HEX_COLOR_REGEX = /#([0-9a-fA-F]{3,8})\b/g;
const FONT_FAMILY_REGEX = /font-family\s*:\s*([^;!]+)[;!]/gi;

function normalizeHexColor(color: string) {
  const normalized = color.startsWith("#") ? color : `#${color}`;
  if (normalized.length === 4) {
    return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`.toUpperCase();
  }
  if (normalized.length === 5) {
    return `#${normalized.slice(1, 4)}${normalized.slice(1, 4)}`.toUpperCase();
  }
  if (normalized.length === 7 || normalized.length === 9) {
    return normalized.slice(0, 7).toUpperCase();
  }
  return null;
}

function dedupe<T>(values: T[]) {
  return Array.from(new Set(values));
}

function fontCategoryFromName(fontName: string): FontCandidate["category"] {
  const lower = fontName.toLowerCase();
  if (lower.includes("mono")) return "mono";
  if (lower.includes("serif")) return lower.includes("slab") ? "slab-serif" : "serif";
  if (lower.includes("script") || lower.includes("hand")) return "handwritten";
  if (lower.includes("display")) return "display";
  return "sans-serif";
}

function buildFontCandidates(fontFamilies: string[]): FontCandidate[] {
  return fontFamilies.slice(0, 3).map((family) => {
    const clean = family
      .split(",")[0]
      .replace(/[\"']/g, "")
      .trim();

    return {
      family: clean,
      category: fontCategoryFromName(clean),
      source: clean.match(/\s/) ? "system" : "unknown",
      usage: "Body/Headings mix",
    } satisfies FontCandidate;
  });
}

function paletteFromHexes(hexes: string[]): ColorSwatch[] {
  if (!hexes.length) {
    return [
      { hex: "#F8F1E8", usage: "primary" },
      { hex: "#D6C8BB", usage: "secondary" },
      { hex: "#A5907A", usage: "accent" },
    ];
  }

  return hexes.slice(0, 5).map((hex, index) => ({
    hex,
    usage: index === 0 ? "primary" : index === 1 ? "secondary" : "accent",
  }));
}

function buildEssenceFromSite(hostname: string, palette: ColorSwatch[], fonts: FontCandidate[]): ImageEssence {
  const dominant = palette[0]?.hex ?? "#F8F1E8";
  const mood = dominant.includes("F") ? ["Bright", "Polished"] : ["Moody", "Grounded"];
  const textures = dominant.includes("F") ? ["Glossy surfaces"] : ["Textural contrast"];

  return {
    summary: `Site ${hostname} leans ${mood[0]?.toLowerCase() ?? "calm"} with ${fonts[0]?.family ?? "modern"} typography.`,
    moodKeywords: mood,
    textures,
    lighting: [dominant.includes("F") ? "Luminous" : "Ambient"],
    composition: [fonts.length > 1 ? "Layered" : "Minimal"],
  } satisfies ImageEssence;
}

export async function analyzeUrlForStyle(url: string): Promise<UrlExtractionResult> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "ReverseMoodboardBot/1.0 (+https://github.com/antoinemoyroud) Mozilla/5.0 (Macintosh; Intel Mac OS X)",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);
    const hostname = new URL(url).hostname.replace(/^www\./, "");

    let cssPayload = "";

    $("style").each((_index, element) => {
      cssPayload += $(element).html() ?? "";
    });

    $("[style]").each((_index, element) => {
      cssPayload += `;${$(element).attr("style") ?? ""}`;
    });

    const hexMatches: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = HEX_COLOR_REGEX.exec(cssPayload)) !== null) {
      const normalized = normalizeHexColor(match[0]);
      if (normalized) {
        hexMatches.push(normalized);
      }
    }

    const fontFamilies: string[] = [];
    let fontMatch: RegExpExecArray | null;
    while ((fontMatch = FONT_FAMILY_REGEX.exec(cssPayload)) !== null) {
      fontFamilies.push(fontMatch[1]);
    }

    const palette = paletteFromHexes(dedupe(hexMatches));
    const fonts = buildFontCandidates(dedupe(fontFamilies));
    const essence = buildEssenceFromSite(hostname, palette, fonts);
    const tags = [hostname, palette[0]?.hex ?? "#F8F1E8", fonts[0]?.family ?? "Sans-serif"];

    return {
      palette,
      fonts,
      essence,
      tags,
    };
  } catch (error) {
    console.error("URL analysis failed", error);
    return {
      palette: [
        { hex: "#F8F1E8", usage: "primary" },
        { hex: "#D6C8BB", usage: "secondary" },
        { hex: "#A5907A", usage: "accent" },
      ],
      fonts: [
        {
          family: "Inter",
          category: "sans-serif",
          source: "unknown",
          usage: "Body",
        },
      ],
      essence: {
        summary: "Calm neutral interface with balanced sans-serif typography.",
        moodKeywords: ["Calm", "Minimal"],
        textures: ["Soft gradients"],
        lighting: ["Ambient"],
        composition: ["Minimal"],
      },
      tags: ["fallback", "neutral", "sans-serif"],
    };
  }
}


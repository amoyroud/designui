import type { ColorSwatch } from "@/lib/types";

type RGB = {
  r: number;
  g: number;
  b: number;
};

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function rgbToHex({ r, g, b }: RGB) {
  const toHex = (value: number) => clampChannel(value).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function mixChannels(color: RGB, factor: number) {
  return {
    r: clampChannel(color.r * factor + 255 * (1 - factor)),
    g: clampChannel(color.g * factor + 255 * (1 - factor)),
    b: clampChannel(color.b * factor + 255 * (1 - factor)),
  } satisfies RGB;
}

function adjustBrightness(color: RGB, delta: number) {
  return {
    r: clampChannel(color.r + delta),
    g: clampChannel(color.g + delta),
    b: clampChannel(color.b + delta),
  } satisfies RGB;
}

export function derivePaletteFromDominant(dominant: RGB): ColorSwatch[] {
  const baseHex = rgbToHex(dominant);
  const lightTint = rgbToHex(mixChannels(dominant, 0.75));
  const lighter = rgbToHex(adjustBrightness(dominant, 35));
  const darker = rgbToHex(adjustBrightness(dominant, -40));
  const accent = rgbToHex({
    r: clampChannel(dominant.b),
    g: clampChannel(dominant.r * 0.7 + dominant.g * 0.3),
    b: clampChannel(dominant.g),
  });

  return [
    { hex: baseHex, usage: "primary" },
    { hex: lightTint, usage: "neutral" },
    { hex: lighter, usage: "secondary" },
    { hex: darker, usage: "accent" },
    { hex: accent, usage: "supporting" },
  ];
}

export function sortPaletteByLuminance(palette: ColorSwatch[]) {
  const computeLuminance = (hex: string) => {
    const sanitized = hex.replace("#", "");
    const r = parseInt(sanitized.slice(0, 2), 16) / 255;
    const g = parseInt(sanitized.slice(2, 4), 16) / 255;
    const b = parseInt(sanitized.slice(4, 6), 16) / 255;

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  return [...palette].sort((a, b) => computeLuminance(a.hex) - computeLuminance(b.hex));
}


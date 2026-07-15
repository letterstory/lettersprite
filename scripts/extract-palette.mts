/**
 * Extracts a brand color palette from a logo image at build time.
 *
 * Reads SITE_LOGO_URL or SITE_LOGO_PATH from the environment, fetches/reads
 * the image, runs a weighted hue histogram over the pixel data (biased toward
 * saturated, non-near-white/black pixels), and picks dominant colors.
 *
 * Output: src/themes/generated-palette.ts — imported by getActiveTheme() as a
 * low-priority base layer. Manual SITE_*_COLOR env vars always override it.
 *
 * Run automatically as `npm run prebuild`. Re-run manually with
 * `node scripts/extract-palette.mts`.
 */

import { writeFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src", "themes", "generated-palette.ts");

const LOGO_URL = process.env.SITE_LOGO_URL ?? "";
const LOGO_PATH = process.env.SITE_LOGO_PATH ?? "";
const ENABLED = process.env.PALETTE_AUTO === "true";

// ── Color math ──────────────────────────────────────────────────────────────

type RGB = { r: number; g: number; b: number };

function toHex({ r, g, b }: RGB): string {
  const h = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function toHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const nr = r / 255, ng = g / 255, nb = b / 255;
  const max = Math.max(nr, ng, nb), min = Math.min(nr, ng, nb);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === nr) h = (ng - nb) / d + (ng < nb ? 6 : 0);
  else if (max === ng) h = (nb - nr) / d + 2;
  else h = (nr - ng) / d + 4;
  return { h: (h / 6) * 360, s, l };
}

function darken(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return toHex({
    r: r * (1 - amount),
    g: g * (1 - amount),
    b: b * (1 - amount),
  });
}

function lighten(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return toHex({
    r: r + (255 - r) * amount,
    g: g + (255 - g) * amount,
    b: b + (255 - b) * amount,
  });
}

function mix(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
  return toHex({ r: ar + (br - ar) * t, g: ag + (bg - ag) * t, b: ab + (bb - ab) * t });
}

// ── Dominant color extraction ────────────────────────────────────────────────

const HUE_BINS = 36; // 10° per bucket

interface Bin {
  totalWeight: number;
  r: number;
  g: number;
  b: number;
}

/**
 * Extract up to `maxColors` dominant, saturated colors from raw RGBA pixel data.
 * Pixels that are near-white, near-black, or near-grey are down-weighted so the
 * output reflects the brand colors rather than background fills.
 */
function extractDominantColors(pixels: Buffer, maxColors = 3): RGB[] {
  const bins: Bin[] = Array.from({ length: HUE_BINS }, () => ({
    totalWeight: 0,
    r: 0,
    g: 0,
    b: 0,
  }));

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];
    if (a < 128) continue; // skip transparent

    const { h, s, l } = toHsl(r, g, b);
    // Down-weight near-white (l > 0.85), near-black (l < 0.1), near-grey (s < 0.15)
    const weight = s * (1 - Math.abs(l - 0.5) * 1.4);
    if (weight < 0.05) continue;

    const bin = Math.floor((h / 360) * HUE_BINS) % HUE_BINS;
    bins[bin].totalWeight += weight;
    bins[bin].r += r * weight;
    bins[bin].g += g * weight;
    bins[bin].b += b * weight;
  }

  // Pick top bins, separated by at least 3 hue buckets (30°) to ensure variety
  const sorted = bins
    .map((b, i) => ({ ...b, i }))
    .filter((b) => b.totalWeight > 0)
    .sort((a, b) => b.totalWeight - a.totalWeight);

  const picked: typeof sorted = [];
  for (const candidate of sorted) {
    const tooClose = picked.some(
      (p) => Math.min(Math.abs(p.i - candidate.i), HUE_BINS - Math.abs(p.i - candidate.i)) < 3,
    );
    if (!tooClose) picked.push(candidate);
    if (picked.length >= maxColors) break;
  }

  return picked.map((b) => ({
    r: Math.round(b.r / b.totalWeight),
    g: Math.round(b.g / b.totalWeight),
    b: Math.round(b.b / b.totalWeight),
  }));
}

// ── Image loading ────────────────────────────────────────────────────────────

async function loadImageBuffer(): Promise<Buffer | null> {
  if (LOGO_PATH) {
    try {
      return await readFile(path.resolve(ROOT, LOGO_PATH));
    } catch {
      console.warn(`[extract-palette] could not read SITE_LOGO_PATH: ${LOGO_PATH}`);
      return null;
    }
  }
  if (LOGO_URL) {
    try {
      const res = await fetch(LOGO_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      console.warn(`[extract-palette] could not fetch SITE_LOGO_URL: ${e}`);
      return null;
    }
  }
  return null;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!ENABLED && !LOGO_URL && !LOGO_PATH) {
    // Write an empty export so the import in index.ts always resolves.
    await writeFile(OUT, `// No logo configured — palette auto-extraction skipped.\nexport const generatedPalette: Partial<import("./types").ThemeColors> = {};\n`);
    return;
  }

  const imgBuffer = await loadImageBuffer();
  if (!imgBuffer) {
    await writeFile(OUT, `// Logo could not be loaded — palette auto-extraction skipped.\nexport const generatedPalette: Partial<import("./types").ThemeColors> = {};\n`);
    return;
  }

  // Resize to a small thumbnail before pixel analysis — fast and noise-free.
  const { data } = await sharp(imgBuffer)
    .resize(80, 80, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const colors = extractDominantColors(data);

  if (colors.length === 0) {
    console.warn("[extract-palette] no dominant colors found — using empty palette");
    await writeFile(OUT, `// No dominant colors found.\nexport const generatedPalette: Partial<import("./types").ThemeColors> = {};\n`);
    return;
  }

  const primary = toHex(colors[0]);
  const secondary = colors[1] ? toHex(colors[1]) : darken(primary, 0.15);
  const accent = colors[2] ? toHex(colors[2]) : lighten(primary, 0.2);
  const heroFrom = darken(primary, 0.2);
  const heroTo = mix(primary, secondary, 0.5);

  const palette = {
    primary,
    secondary,
    accent,
    heroFrom,
    heroTo,
    link: primary,
    kicker: primary,
  };

  const lines = Object.entries(palette)
    .map(([k, v]) => `  ${k}: "${v}",`)
    .join("\n");

  const src = `// Auto-generated by scripts/extract-palette.mts — do not edit by hand.
// Re-run via \`npm run build\` or \`node scripts/extract-palette.mts\`.
// Manual SITE_*_COLOR env vars always take precedence over these values.
export const generatedPalette: Partial<import("./types").ThemeColors> = {
${lines}
};
`;

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, src);
  console.log(`[extract-palette] palette extracted from logo:`);
  Object.entries(palette).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
}

await main();

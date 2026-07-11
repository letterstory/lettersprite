/**
 * Generates the fallback blog cover images.
 *
 * For every registered theme it builds `FALLBACK_COVER_VARIANTS` geometric
 * *tessellation* patterns as SVG — colored from that theme's palette — and
 * rasterizes each to a PNG under `public/covers/<theme>-<n>.png`. The runtime
 * (`src/lib/covers.ts`) picks one deterministically per post that has no
 * Letterbrace cover image.
 *
 * Run with `npm run generate:covers`. Re-run whenever you add a theme or change
 * a theme's colors. Themes are auto-discovered from `src/themes/`, so no list
 * to maintain here.
 *
 * Plain Node script (Node >= 23 strips the TS types on the fly); the only
 * dependency is `sharp` (dev-only, for SVG -> PNG).
 */
import { readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import {
  FALLBACK_COVER_VARIANTS,
  FALLBACK_COVER_DIR,
  FALLBACK_COVER_WIDTH as W,
  FALLBACK_COVER_HEIGHT as H,
} from "../src/lib/covers-config.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const THEMES_DIR = path.join(ROOT, "src", "themes");
const OUT_DIR = path.join(ROOT, "public", FALLBACK_COVER_DIR);

// Theme modules that don't export a theme object.
const SKIP = new Set(["index.ts", "types.ts", "css.ts"]);

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

type RGB = { r: number; g: number; b: number };

function parseHex(hex: string): RGB {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function toHex({ r, g, b }: RGB): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Linear blend between two hex colors. t=0 -> a, t=1 -> b. */
function mix(a: string, b: string, t: number): string {
  const x = parseHex(a);
  const y = parseHex(b);
  return toHex({
    r: x.r + (y.r - x.r) * t,
    g: x.g + (y.g - x.g) * t,
    b: x.b + (y.b - x.b) * t,
  });
}

// ---------------------------------------------------------------------------
// SVG primitives
// ---------------------------------------------------------------------------

const f = (x: number) => Number(x.toFixed(1));

function poly(points: string, fill: string, stroke?: { c: string; w: number }): string {
  const s = stroke ? ` stroke="${stroke.c}" stroke-width="${stroke.w}"` : "";
  return `<polygon points="${points}" fill="${fill}"${s}/>`;
}

type Palette = {
  /** Subtle full-canvas background fill. */
  bg: string;
  /** Five clearly-visible shape tones, light -> strong, derived from the theme. */
  tones: string[];
};

/** Build a theme palette: a subtle background plus five visible shape tones. */
function paletteFor(colors: { background: string; primary: string; foreground: string }): Palette {
  const { background, primary } = colors;
  return {
    bg: mix(background, primary, 0.05),
    tones: [0.13, 0.24, 0.36, 0.5, 0.66].map((t) => mix(background, primary, t)),
  };
}

// ---------------------------------------------------------------------------
// Tessellation patterns. Each returns SVG markup covering the whole canvas.
// All tile seamlessly; loops overshoot the edges so nothing is clipped short.
// ---------------------------------------------------------------------------

/** Rotated-square checkerboard (diamonds). */
function diamonds(a: string, b: string): string {
  const c = 84;
  const cx = W / 2;
  const cy = H / 2;
  const R = Math.ceil((W + H) / c) + 2;
  let s = `<g transform="rotate(45 ${cx} ${cy})">`;
  for (let j = -R; j < R; j++) {
    for (let i = -R; i < R; i++) {
      const tone = (i + j) & 1 ? a : b;
      const x = f(cx + i * c - c / 2);
      const y = f(cy + j * c - c / 2);
      s += `<rect x="${x}" y="${y}" width="${c}" height="${c}" fill="${tone}"/>`;
    }
  }
  return s + `</g>`;
}

/** Equilateral triangle mosaic; a thin "grout" stroke keeps facets crisp. */
function triangles(tones: string[], stroke: { c: string; w: number }): string {
  const side = 92;
  const th = (side * Math.sqrt(3)) / 2;
  let s = "";
  let row = 0;
  for (let y = -th; y < H + th; y += th, row++) {
    let k = 0;
    for (let x = -side; x < W + side; x += side, k++) {
      const up = tones[(row + k) % tones.length];
      s += poly(`${f(x)},${f(y + th)} ${f(x + side / 2)},${f(y)} ${f(x + side)},${f(y + th)}`, up, stroke);
      const down = tones[(row + k + 1) % tones.length];
      s += poly(
        `${f(x + side / 2)},${f(y)} ${f(x + side)},${f(y + th)} ${f(x + side * 1.5)},${f(y)}`,
        down,
        stroke,
      );
    }
  }
  return s;
}

function hexagonPoints(cx: number, cy: number, R: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 90); // pointy-top
    pts.push(`${f(cx + R * Math.cos(a))},${f(cy + R * Math.sin(a))}`);
  }
  return pts.join(" ");
}

/** Honeycomb of pointy-top hexagons with subtle "grout" between cells. */
function hexagons(bg: string, tones: string[]): string {
  const R = 56;
  const hw = Math.sqrt(3) * R;
  const vs = 1.5 * R;
  const stroke = { c: bg, w: 2.2 };
  let s = "";
  let row = 0;
  for (let cy = 0; cy < H + R; cy += vs, row++) {
    const off = row % 2 ? hw / 2 : 0;
    let col = 0;
    for (let cx = off - hw; cx < W + hw; cx += hw, col++) {
      const tone = tones[(col + row * 2) % tones.length];
      s += poly(hexagonPoints(cx, cy, R), tone, stroke);
    }
  }
  return s;
}

/** Isometric "tumbling blocks": three rhombus faces per cube for a 3D read. */
function cubes(bg: string, top: string, left: string, right: string): string {
  const a = 58;
  const hx = (a * Math.sqrt(3)) / 2;
  const hw = Math.sqrt(3) * a;
  const vs = 1.5 * a;
  const stroke = { c: bg, w: 1.6 };
  let s = "";
  let row = 0;
  for (let cy = 0; cy < H + a; cy += vs, row++) {
    const off = row % 2 ? hw / 2 : 0;
    for (let cx = off - hw; cx < W + hw; cx += hw) {
      s += poly(
        `${f(cx)},${f(cy - a)} ${f(cx + hx)},${f(cy - a / 2)} ${f(cx)},${f(cy)} ${f(cx - hx)},${f(cy - a / 2)}`,
        top,
        stroke,
      );
      s += poly(
        `${f(cx - hx)},${f(cy - a / 2)} ${f(cx)},${f(cy)} ${f(cx)},${f(cy + a)} ${f(cx - hx)},${f(cy + a / 2)}`,
        left,
        stroke,
      );
      s += poly(
        `${f(cx)},${f(cy)} ${f(cx + hx)},${f(cy - a / 2)} ${f(cx + hx)},${f(cy + a / 2)} ${f(cx)},${f(cy + a)}`,
        right,
        stroke,
      );
    }
  }
  return s;
}

/** Constant-thickness zigzag bands (chevron). */
function chevron(a: string, b: string): string {
  const seg = 72;
  const amp = seg;
  const band = Math.round(seg * 1.35);
  const xs: number[] = [];
  for (let x = -seg; x <= W + seg + 0.5; x += seg) xs.push(x);
  const dy = (i: number) => (i % 2 ? amp : 0);
  let s = "";
  let idx = 0;
  for (let baseY = -amp - band; baseY < H + band; baseY += band, idx++) {
    const tone = idx % 2 ? a : b;
    const top = xs.map((x, i) => `${f(x)},${f(baseY + dy(i))}`);
    const bot = xs.map((x, i) => `${f(x)},${f(baseY + band + dy(i))}`).reverse();
    s += `<polygon points="${top.join(" ")} ${bot.join(" ")}" fill="${tone}"/>`;
  }
  return s;
}

/** Truncated-square tiling: octagons with small diamonds at the joints. */
function octagons(oct: string, sq: string): string {
  const c = 104;
  const cut = (c * (Math.SQRT2 - 1)) / 2;
  const stroke = { c: sq, w: 1.4 };
  let s = "";
  for (let y = 0; y < H + c; y += c) {
    for (let x = 0; x < W + c; x += c) {
      const x0 = x, x1 = x + cut, x2 = x + c - cut, x3 = x + c;
      const y0 = y, y1 = y + cut, y2 = y + c - cut, y3 = y + c;
      s += poly(
        `${f(x1)},${f(y0)} ${f(x2)},${f(y0)} ${f(x3)},${f(y1)} ${f(x3)},${f(y2)} ${f(x2)},${f(y3)} ${f(x1)},${f(y3)} ${f(x0)},${f(y2)} ${f(x0)},${f(y1)}`,
        oct,
        stroke,
      );
    }
  }
  for (let y = 0; y <= H + c; y += c) {
    for (let x = 0; x <= W + c; x += c) {
      s += poly(`${f(x)},${f(y - cut)} ${f(x + cut)},${f(y)} ${f(x)},${f(y + cut)} ${f(x - cut)},${f(y)}`, sq);
    }
  }
  return s;
}

// ---------------------------------------------------------------------------
// The variations. Order is stable: index maps to `<theme>-<index>.png`.
// ---------------------------------------------------------------------------

type Variation = (p: Palette) => { background: string; shapes: string };

const VARIATIONS: Variation[] = [
  ({ bg, tones }) => ({ background: bg, shapes: diamonds(tones[0], tones[2]) }),
  ({ bg, tones }) => ({
    background: bg,
    shapes: triangles([tones[0], tones[1], tones[2], tones[3]], { c: bg, w: 2 }),
  }),
  ({ bg, tones }) => ({ background: bg, shapes: hexagons(bg, [tones[0], tones[1], tones[3]]) }),
  ({ bg, tones }) => ({ background: bg, shapes: cubes(bg, tones[0], tones[3], tones[1]) }),
  ({ bg, tones }) => ({ background: bg, shapes: chevron(tones[1], tones[3]) }),
  ({ tones }) => ({ background: tones[0], shapes: octagons(tones[0], tones[3]) }),
];

if (VARIATIONS.length !== FALLBACK_COVER_VARIANTS) {
  throw new Error(
    `FALLBACK_COVER_VARIANTS (${FALLBACK_COVER_VARIANTS}) must equal the number of ` +
      `variations defined here (${VARIATIONS.length}).`,
  );
}

function svgFor(palette: { bg: string; ramp: string[] }, variation: Variation): string {
  const { background, shapes } = variation(palette);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<rect width="${W}" height="${H}" fill="${background}"/>` +
    shapes +
    `</svg>`
  );
}

// ---------------------------------------------------------------------------
// Theme discovery + generation
// ---------------------------------------------------------------------------

type ThemeLike = { name: string; colors: { background: string; primary: string; foreground: string } };

function isThemeLike(v: unknown): v is ThemeLike {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as ThemeLike).name === "string" &&
    typeof (v as ThemeLike).colors === "object" &&
    typeof (v as ThemeLike).colors?.background === "string" &&
    typeof (v as ThemeLike).colors?.primary === "string"
  );
}

async function discoverThemes(): Promise<ThemeLike[]> {
  const files = (await readdir(THEMES_DIR)).filter(
    (name) => name.endsWith(".ts") && !SKIP.has(name),
  );
  const themes: ThemeLike[] = [];
  for (const file of files.sort()) {
    const mod = await import(pathToFileURL(path.join(THEMES_DIR, file)).href);
    const theme = Object.values(mod).find(isThemeLike);
    if (theme) themes.push(theme);
    else console.warn(`  (skipped ${file}: no theme export found)`);
  }
  return themes;
}

async function main(): Promise<void> {
  const themes = await discoverThemes();
  if (themes.length === 0) throw new Error(`No themes found in ${THEMES_DIR}`);

  await mkdir(OUT_DIR, { recursive: true });

  let count = 0;
  for (const theme of themes) {
    const palette = paletteFor(theme.colors);
    for (let i = 0; i < VARIATIONS.length; i++) {
      const svg = svgFor(palette, VARIATIONS[i]);
      const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
      await writeFile(path.join(OUT_DIR, `${theme.name}-${i}.png`), png);
      count++;
    }
    console.log(`  ${theme.name}: ${VARIATIONS.length} covers`);
  }

  console.log(
    `Generated ${count} cover${count === 1 ? "" : "s"} for ${themes.length} theme` +
      `${themes.length === 1 ? "" : "s"} in ${path.relative(ROOT, OUT_DIR)}/`,
  );
}

await main();

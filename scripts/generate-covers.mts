/**
 * Generates the fallback blog cover images.
 *
 * For every registered theme it builds every cover *set* (a distinct family of
 * full-bleed abstract patterns — geometric, gradient, organic…) colored from
 * that theme's palette, and rasterizes each variation to a PNG under
 * `public/covers/<theme>-<set>-<n>.png`. The runtime (`src/lib/covers.ts`) picks
 * one set per blog (hashed from the blog title) and one variation per post.
 *
 * Run with `npm run generate:covers`. Re-run whenever you add a theme, add/rename
 * a set, or change a theme's colors. Themes are auto-discovered from
 * `src/themes/`, and the set list is validated against `COVER_SETS` in
 * `src/lib/covers-config.ts`, so both stay in lockstep with the runtime.
 *
 * Plain Node script (Node >= 23 strips the TS types on the fly); the only
 * dependency is `sharp` (dev-only, for SVG -> PNG).
 */
import { readdir, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import {
  COVER_SETS,
  VARIANTS_PER_SET,
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
  /** Five clearly-visible shape tones, derived across the theme's brand colors. */
  tones: string[];
};

type CoverColors = {
  background: string;
  primary: string;
  foreground: string;
  secondary?: string;
  accent?: string;
};

/**
 * Build a vibrant, multi-hue palette: a subtle background plus five visible
 * shape tones that traverse the theme's primary, secondary and accent colors,
 * so generated covers feel like real editorial art rather than a single-hue
 * gradient. Works for both light and dark themes (the mix toward the brand
 * color reads as neon-on-black on dark palettes).
 */
function paletteFor(colors: CoverColors): Palette {
  const { background, primary } = colors;
  const secondary = colors.secondary ?? primary;
  const accent = colors.accent ?? secondary;
  return {
    bg: mix(background, primary, 0.05),
    tones: [
      mix(background, primary, 0.14),
      mix(background, secondary, 0.3),
      mix(background, primary, 0.5),
      mix(background, accent, 0.62),
      mix(background, secondary, 0.78),
    ],
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
// Cover sets. Each set is a family of `VARIANTS_PER_SET` variations; a blog uses
// exactly one set (see src/lib/covers.ts). A `Variation` paints the whole canvas
// from the theme `Palette`. Order + names must match `COVER_SETS`.
// ---------------------------------------------------------------------------

type Variation = (p: Palette) => { background: string; shapes: string };

/** Angular geometric mosaics — the original set. */
const SET_tessellation: Variation[] = [
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

// ---- set: gradient-mesh — Soft, luminous color fields: a full-canvas linear or radial gradient walking from the background through the theme tones, layered with large semi-transparent radial light blooms for a premium aurora/haze depth. ----
// A tiny deterministic hash -> [0,1) for organic-but-repeatable bloom placement.
function gradientMeshRnd(seed) {
  let t = (seed * 1831565813) >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// Full-canvas base field: a linear gradient walking bg through several tones.
// `stops` is an array of [offset0to1, color]. The rect is exactly W x H at 0,0
// so the field is full-bleed with no uncovered margin.
function gradientMeshLinearBase(id, angleDeg, stops) {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a), dy = Math.sin(a);
  const x1 = f(0.5 - dx * 0.5), y1 = f(0.5 - dy * 0.5);
  const x2 = f(0.5 + dx * 0.5), y2 = f(0.5 + dy * 0.5);
  let s = `<defs><linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">`;
  for (const [o, c] of stops) s += `<stop offset="${f(o * 100)}%" stop-color="${c}"/>`;
  s += `</linearGradient></defs>`;
  s += `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#${id})"/>`;
  return s;
}

// Full-canvas base field: a radial gradient centered at (cx,cy) in fractions,
// with a large radius so it fills every corner edge-to-edge.
function gradientMeshRadialBase(id, cx, cy, stops) {
  let s = `<defs><radialGradient id="${id}" cx="${f(cx * 100)}%" cy="${f(cy * 100)}%" r="95%" fx="${f(cx * 100)}%" fy="${f(cy * 100)}%">`;
  for (const [o, c] of stops) s += `<stop offset="${f(o * 100)}%" stop-color="${c}"/>`;
  s += `</radialGradient></defs>`;
  s += `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#${id})"/>`;
  return s;
}

// One soft light bloom: an ellipse filled with a radialGradient that fades a
// bright tone through a midpoint to fully transparent, for an atmospheric haze.
function gradientMeshBloom(id, cx, cy, rx, ry, color, edge, op) {
  let s = `<defs><radialGradient id="${id}" cx="50%" cy="50%" r="50%">`;
  s += `<stop offset="0%" stop-color="${color}" stop-opacity="${f(op)}"/>`;
  s += `<stop offset="45%" stop-color="${mix(color, edge, 0.5)}" stop-opacity="${f(op * 0.55)}"/>`;
  s += `<stop offset="100%" stop-color="${edge}" stop-opacity="0"/>`;
  s += `</radialGradient></defs>`;
  s += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#${id})"/>`;
  return s;
}

// Scatter N atmospheric blooms deterministically over (and past) the canvas.
// `pick` maps bloom index -> tone index; blooms fade toward `edge` (usually bg).
function gradientMeshBloomField(prefix, seed, count, tones, pick, edge, spread, strength) {
  const rnd = gradientMeshRnd(seed);
  let s = "";
  for (let i = 0; i < count; i++) {
    const cx = (rnd() * 1.5 - 0.25) * W;
    const cy = (rnd() * 1.5 - 0.25) * H;
    const base = 0.32 + rnd() * 0.34;
    const rx = base * W * spread;
    const ry = rx * (0.62 + rnd() * 0.5);
    const color = tones[pick(i, rnd)];
    const op = strength * (0.5 + rnd() * 0.5);
    s += gradientMeshBloom(`${prefix}${i}`, cx, cy, rx, ry, color, edge, op);
  }
  return s;
}

const SET_gradient_mesh: Variation[] = [
  (p) => ({ background: p.bg, shapes: gradientMeshLinearBase("gmLin1", 55, [[0, p.bg],[0.35, p.tones[1]],[0.7, p.tones[3]],[1, p.tones[4]]]) + gradientMeshBloom("gmB1a", W * 0.2, H * 0.3, W * 0.62, W * 0.52, p.tones[4], p.bg, 0.7) + gradientMeshBloom("gmB1b", W * 0.84, H * 0.76, W * 0.56, W * 0.46, p.tones[2], p.bg, 0.58) + gradientMeshBloom("gmB1c", W * 0.66, H * 0.08, W * 0.5, W * 0.42, p.tones[3], p.tones[1], 0.48) }),
  (p) => ({ background: p.bg, shapes: gradientMeshRadialBase("gmRad2", 0.32, 0.38, [[0, p.tones[3]],[0.4, p.tones[2]],[0.75, p.tones[1]],[1, p.bg]]) + gradientMeshBloom("gmB2a", W * 0.3, H * 0.35, W * 0.55, W * 0.5, p.tones[4], p.bg, 0.7) + gradientMeshBloom("gmB2b", W * 0.9, H * 0.2, W * 0.4, W * 0.32, p.tones[3], p.bg, 0.55) + gradientMeshBloom("gmB2c", W * 0.75, H * 0.95, W * 0.5, W * 0.4, p.tones[2], p.bg, 0.5) }),
  (p) => ({ background: p.bg, shapes: gradientMeshLinearBase("gmLin3", 100, [[0, p.tones[4]],[0.4, p.tones[3]],[0.72, p.tones[1]],[1, p.bg]]) + gradientMeshBloomField("gmF3", 7, 5, p.tones, (i) => [4, 2, 3, 1, 4][i % 5], p.bg, 1.0, 0.5) }),
  (p) => ({ background: p.bg, shapes: gradientMeshLinearBase("gmLin4", 8, [[0, p.tones[1]],[0.5, p.tones[3]],[1, p.tones[4]]]) + gradientMeshBloom("gmB4a", W * 0.16, H * 0.7, W * 0.52, W * 0.6, p.tones[4], p.bg, 0.68) + gradientMeshBloom("gmB4b", W * 0.88, H * 0.32, W * 0.5, W * 0.55, p.tones[2], p.bg, 0.62) + gradientMeshBloom("gmB4c", W * 0.52, H * 1.02, W * 0.42, W * 0.3, p.tones[3], p.tones[0], 0.45) }),
  (p) => ({ background: p.bg, shapes: gradientMeshRadialBase("gmRad5", 0.85, 0.15, [[0, p.tones[4]],[0.3, p.tones[3]],[0.62, p.tones[2]],[0.85, p.tones[0]],[1, p.bg]]) + gradientMeshBloom("gmB5a", W * 0.85, H * 0.15, W * 0.45, W * 0.4, p.tones[4], p.bg, 0.65) + gradientMeshBloom("gmB5b", W * 0.1, H * 0.9, W * 0.55, W * 0.5, p.tones[1], p.bg, 0.55) + gradientMeshBloom("gmB5c", W * 0.45, H * 0.55, W * 0.4, W * 0.34, p.tones[3], p.tones[1], 0.42) }),
  (p) => ({ background: p.bg, shapes: gradientMeshLinearBase("gmLin6", 135, [[0, p.bg],[0.3, p.tones[1]],[0.6, p.tones[2]],[0.85, p.tones[3]],[1, p.tones[4]]]) + gradientMeshBloomField("gmF6", 19, 6, p.tones, (i) => [3, 4, 2, 4, 3, 1][i % 6], p.bg, 0.85, 0.42) })
];

// ---- set: waves — Stacked flowing sine-wave bands filling the canvas top to bottom as smooth layered ribbons, dunes, and soundwaves in successive palette tones. ----
// Tiny pure seeded PRNG (mulberry32) for repeatable organic wobble.
function wavesRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One filled wave band: a smooth cubic-bezier top edge (overshooting both sides)
// closed straight down past the bottom so everything below the curve is filled.
function wavesBand(
  baseY: number,
  amp: number,
  wavelength: number,
  phase: number,
  tilt: number,
  fill: string,
): string {
  const over = 220;
  const x0 = -over;
  const x1 = W + over;
  const seg = Math.max(60, wavelength / 2);
  const yAt = (x: number) =>
    baseY + tilt * (x / W) + amp * Math.sin((x / wavelength) * 2 * Math.PI + phase);
  let d = `M ${f(x0)} ${f(yAt(x0))}`;
  let prevX = x0;
  let prevY = yAt(x0);
  for (let x = x0 + seg; x <= x1 + 0.5; x += seg) {
    const cx = (prevX + x) / 2;
    const y = yAt(x);
    d += ` C ${f(cx)} ${f(prevY)}, ${f(cx)} ${f(y)}, ${f(x)} ${f(y)}`;
    prevX = x;
    prevY = y;
  }
  d += ` L ${f(x1)} ${f(H + over)} L ${f(x0)} ${f(H + over)} Z`;
  return `<path d="${d}" fill="${fill}"/>`;
}

// Stack of wave bands from above the top edge down past the bottom. A solid
// full-bleed backdrop in the first band's tone guarantees zero background leak
// no matter how the wavy edges curve. `reverse` flips tone order (light->dark
// vs dark->light); `wobble` adds deterministic organic variation.
function wavesStack(
  tones: string[],
  opts: {
    bands: number;
    ampBase: number;
    ampStep: number;
    wavelength: number;
    phaseStep: number;
    tilt?: number;
    reverse?: boolean;
    wobble?: boolean;
  },
): string {
  const bands = opts.bands;
  const ampBase = opts.ampBase;
  const ampStep = opts.ampStep;
  const wavelength = opts.wavelength;
  const phaseStep = opts.phaseStep;
  const tilt = opts.tilt || 0;
  const reverse = !!opts.reverse;
  const wobble = !!opts.wobble;
  const rng = wavesRng(1337 + bands * 7 + Math.round(wavelength) + Math.round(Math.abs(tilt)));
  const toneAt = (i: number) =>
    tones[reverse ? tones.length - 1 - (i % tones.length) : i % tones.length];
  let s = `<rect x="-4" y="-4" width="${W + 8}" height="${H + 8}" fill="${toneAt(0)}"/>`;
  const first = -(Math.abs(tilt) + ampBase + 120);
  const span = H + 360 - first;
  for (let i = 1; i < bands; i++) {
    const t = i / (bands - 1);
    const baseY = first + span * t;
    const amp = ampBase + ampStep * i + (wobble ? (rng() - 0.5) * 30 : 0);
    const wl = wavelength * (1 + (wobble ? (rng() - 0.5) * 0.28 : 0));
    const ph = phaseStep * i + (wobble ? rng() * 0.8 : 0);
    s += wavesBand(baseY, amp, wl, ph, tilt, toneAt(i));
  }
  return s;
}

const SET_waves: Variation[] = [
  (p) => ({ background: p.bg, shapes: wavesStack(p.tones, { bands: 6, ampBase: 26, ampStep: 4, wavelength: 520, phaseStep: 0.9, tilt: 0, reverse: false, wobble: false }) }),
  (p) => ({ background: p.bg, shapes: wavesStack(p.tones, { bands: 5, ampBase: 44, ampStep: 6, wavelength: 760, phaseStep: 1.7, tilt: 0, reverse: true, wobble: false }) }),
  (p) => ({ background: p.bg, shapes: wavesStack(p.tones, { bands: 7, ampBase: 20, ampStep: 3, wavelength: 400, phaseStep: 2.4, tilt: 110, reverse: false, wobble: false }) }),
  (p) => ({ background: p.bg, shapes: wavesStack(p.tones, { bands: 6, ampBase: 34, ampStep: 5, wavelength: 600, phaseStep: 1.2, tilt: -130, reverse: true, wobble: true }) }),
  (p) => ({ background: p.bg, shapes: wavesStack(p.tones, { bands: 9, ampBase: 16, ampStep: 2, wavelength: 340, phaseStep: 0.6, tilt: 0, reverse: false, wobble: true }) }),
  (p) => ({ background: p.bg, shapes: wavesStack(p.tones, { bands: 4, ampBase: 56, ampStep: 8, wavelength: 900, phaseStep: 2.0, tilt: 80, reverse: true, wobble: false }) })
];

// ---- set: rings — Bold concentric ripples radiating from one to three focal points — alternating filled rings and stroked contour arcs that read like topographic lines or water ripples, sized so the outer rings spill past every edge. ----
// Deterministic tiny PRNG (mulberry32) — pure, seeded by an integer literal.
function ringsRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Distance from (cx,cy) to the farthest canvas corner — the radius that guarantees full bleed.
function ringsCover(cx, cy) {
  const dx = Math.max(cx, W - cx);
  const dy = Math.max(cy, H - cy);
  return Math.sqrt(dx * dx + dy * dy);
}

// A stack of FILLED concentric discs, drawn largest-first so smaller ones layer on top.
// Alternates tones so you get solid ripple bands. Fully covers the canvas because the
// outermost disc radius >= corner distance. spacingMode: 0 even, 1 expanding, 2 contracting.
function ringsFilled(tones, bg, cx, cy, count, startTone, dir, spacingMode) {
  const cover = ringsCover(cx, cy) + 40;
  // Build ascending radii list, then draw descending.
  const radii = [];
  if (spacingMode === 0) {
    for (let i = 1; i <= count; i++) radii.push((cover * i) / count);
  } else if (spacingMode === 1) {
    // expanding: bands get wider outward
    let acc = 0, w = 1, total = 0;
    const weights = [];
    for (let i = 0; i < count; i++) { weights.push(w); total += w; w *= 1.35; }
    for (let i = 0; i < count; i++) { acc += weights[i]; radii.push((cover * acc) / total); }
  } else {
    // contracting: bands get wider toward center
    let acc = 0, w = 1, total = 0;
    const weights = [];
    for (let i = 0; i < count; i++) { weights.push(w); total += w; w *= 0.78; }
    for (let i = 0; i < count; i++) { acc += weights[i]; radii.push((cover * acc) / total); }
  }
  let out = "";
  for (let i = count - 1; i >= 0; i--) {
    const toneIdx = (startTone + i * dir % 5 + 500) % 5;
    const t = ((toneIdx % 5) + 5) % 5;
    // Blend outer bands slightly toward bg for depth, inner bands full strength.
    const depth = i / Math.max(1, count - 1); // 1 at outer, 0 at inner
    const col = mix(tones[t], bg, depth * 0.28);
    out += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(radii[i])}" fill="${col}"/>`;
  }
  return out;
}

// A set of STROKED concentric rings (fill none) — topographic contour look — over an
// existing background/fill. Strokes overshoot the canvas because max radius >= corner dist.
function ringsStroked(tones, bg, cx, cy, count, startTone, dir, sw, spacingMode, fadeToward) {
  const cover = ringsCover(cx, cy) + sw;
  let out = "";
  for (let i = 1; i <= count; i++) {
    let frac;
    if (spacingMode === 0) frac = i / count;
    else if (spacingMode === 1) frac = Math.pow(i / count, 1.55); // expanding gaps outward
    else frac = Math.pow(i / count, 0.62);                        // tightening gaps outward
    const r = cover * frac;
    if (r < sw) continue;
    const toneIdx = (((startTone + i * dir) % 5) + 5) % 5;
    const fade = fadeToward >= 0 ? (1 - i / count) * 0.35 : 0;
    const col = fade > 0 ? mix(tones[toneIdx], bg, fade) : tones[toneIdx];
    out += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="${col}" stroke-width="${f(sw)}"/>`;
  }
  return out;
}

// Full-canvas base fill (edge-to-edge) using a chosen tone or bg.
function ringsBase(col) {
  return `<rect x="0" y="0" width="${W}" height="${H}" fill="${col}"/>`;
}

const SET_rings: Variation[] = [
  (p) => ({ background: p.bg, shapes: ringsBase(mix(p.tones[0], p.bg, 0.5)) + ringsFilled(p.tones, p.bg, W * 0.28, H * 0.5, 7, 0, 1, 1) }),
  (p) => ({ background: p.bg, shapes: ringsBase(p.tones[4]) + ringsStroked(p.tones, p.bg, W * 1.02, H * 0.15, 22, 3, 1, 6, 1, 1) }),
  (p) => ({ background: p.bg, shapes: ringsBase(mix(p.tones[0], p.bg, 0.35)) + ringsStroked(p.tones, p.bg, W * -0.05, H * 1.08, 18, 4, -1, 9, 2, -1) + ringsStroked(p.tones, p.bg, W * 1.05, H * -0.08, 18, 2, 1, 5, 2, 1) }),
  (p) => ({ background: p.bg, shapes: ringsBase(mix(p.tones[0], p.bg, 0.55)) + ringsFilled(p.tones, p.bg, W * 0.5, H * 0.5, 9, 1, 1, 0) }),
  (p) => ((rng) => ({ background: p.bg, shapes: ringsBase(mix(p.tones[0], p.bg, 0.4)) + ((cx1) => ((cy1) => ((cx2) => ((cy2) => ringsFilled(p.tones, p.bg, cx1, cy1, 6, 2, 1, 2) + ringsStroked(p.tones, p.bg, cx2, cy2, 16, 4, -1, 4, 0, 0))(H * (0.9 + rng() * 0.25)))(W * (0.82 + rng() * 0.15)))(H * (0.05 + rng() * 0.1)))(W * (0.12 + rng() * 0.12)) }))(ringsRng(1337)),
  (p) => ({ background: p.bg, shapes: ringsBase(p.bg) + ringsFilled(p.tones, p.bg, W * 0.85, H * 0.9, 6, 4, -1, 1) + ringsStroked(p.tones, p.bg, W * 0.85, H * 0.9, 20, 0, 1, 3, 1, 0) })
];

// ---- set: halftone — A crisp print-style halftone dot field on a square or hex-offset lattice whose dot radii swell and shrink across a smooth ramp, radial, sine, or diagonal gradient to read as duotone shading. ----
function halftoneRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function halftoneField(mode, nx, ny) {
  switch (mode) {
    case 0:
      return nx;
    case 1:
      return ny;
    case 2:
      return (nx + ny) * 0.5;
    case 3: {
      const dx = nx - 0.5, dy = ny - 0.5;
      return 1 - Math.sqrt(dx * dx + dy * dy) / 0.7071;
    }
    case 4:
      return 0.5 + 0.5 * Math.sin(nx * Math.PI * 2.2 + ny * Math.PI * 1.1);
    case 5: {
      const dx = nx - 1, dy = ny - 1;
      return 1 - Math.sqrt(dx * dx + dy * dy) / 1.4142;
    }
    default:
      return nx;
  }
}

function halftoneDots(p, opts) {
  const step = opts.step;
  const mode = opts.mode;
  const hex = opts.hex;
  const maxR = opts.maxR;
  const minR = opts.minR;
  const loTone = opts.loTone;
  const hiTone = opts.hiTone;
  const twoTone = opts.twoTone;
  const invert = opts.invert;
  const jitter = opts.jitter;
  const rng = halftoneRng(1337 + mode * 97 + (hex ? 41 : 0) + Math.round(step));
  const rMax = step * maxR;
  const rMin = step * minR;
  const cols = Math.ceil(W / step) + 2;
  const rows = Math.ceil(H / step) + 2;
  let out = "";
  for (let j = -1; j <= rows; j++) {
    const offset = hex && (j & 1) ? step * 0.5 : 0;
    for (let i = -1; i <= cols; i++) {
      const cx = i * step + offset - step * 0.5;
      const cy = j * step - step * 0.5;
      const px = cx + (jitter ? (rng() - 0.5) * step * jitter : 0);
      const py = cy + (jitter ? (rng() - 0.5) * step * jitter : 0);
      let field = halftoneField(
        mode,
        Math.max(0, Math.min(1, px / W)),
        Math.max(0, Math.min(1, py / H))
      );
      if (invert) field = 1 - field;
      field = Math.max(0, Math.min(1, field));
      const r = rMin + (rMax - rMin) * field;
      if (r < 0.4) continue;
      const fill = twoTone
        ? mix(p.tones[loTone], p.tones[hiTone], field)
        : p.tones[hiTone];
      out += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(r)}" fill="${fill}"/>`;
    }
  }
  return out;
}

const SET_halftone: Variation[] = [
  (p) => ({ background: p.bg, shapes: halftoneDots(p, { step: 44, mode: 0, hex: false, maxR: 0.62, minR: 0.04, loTone: 1, hiTone: 4, twoTone: false, invert: false, jitter: 0 }) }),
  (p) => ({ background: mix(p.bg, p.tones[0], 0.5), shapes: halftoneDots(p, { step: 40, mode: 3, hex: true, maxR: 0.6, minR: 0.02, loTone: 2, hiTone: 4, twoTone: false, invert: false, jitter: 0 }) }),
  (p) => ({ background: p.bg, shapes: halftoneDots(p, { step: 48, mode: 2, hex: false, maxR: 0.66, minR: 0.06, loTone: 1, hiTone: 3, twoTone: true, invert: false, jitter: 0 }) }),
  (p) => ({ background: p.bg, shapes: halftoneDots(p, { step: 38, mode: 4, hex: true, maxR: 0.58, minR: 0.05, loTone: 2, hiTone: 4, twoTone: true, invert: false, jitter: 0 }) }),
  (p) => ({ background: mix(p.bg, p.tones[0], 0.35), shapes: halftoneDots(p, { step: 52, mode: 5, hex: false, maxR: 0.64, minR: 0.03, loTone: 0, hiTone: 4, twoTone: true, invert: false, jitter: 0.18 }) }),
  (p) => ({ background: p.bg, shapes: halftoneDots(p, { step: 42, mode: 1, hex: true, maxR: 0.6, minR: 0.04, loTone: 3, hiTone: 4, twoTone: false, invert: true, jitter: 0 }) })
];

// ---- set: blobs — Large, soft, overlapping organic blobs with smooth Bezier edges and subtle gradient depth, layered in theme tones over a filled base for a modern fluid/lava aesthetic. ----
function blobsRng(seed) {
  let a = (seed >>> 0) || 1;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Closed blob path: n control points around (cx,cy) with per-vertex jittered
// radius, joined into a smooth closed loop via catmull-rom-derived cubics.
function blobsPath(cx, cy, rx, ry, n, spike, seed) {
  const rng = blobsRng(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2;
    const jitter = 1 - spike + rng() * spike * 2;
    pts.push([cx + Math.cos(ang) * rx * jitter, cy + Math.sin(ang) * ry * jitter]);
  }
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + "Z";
}

// One blob: flat tone fill, or a linear-gradient fill (tone -> tone/bg) for depth.
function blobsShape(spec, tones, bg, idPrefix, idx) {
  const path = blobsPath(spec.cx, spec.cy, spec.rx, spec.ry, spec.n, spec.spike, spec.seed);
  if (spec.grad) {
    const id = `${idPrefix}g${idx}`;
    const c0 = tones[spec.t0];
    const c1 = spec.t1 < 0 ? bg : tones[spec.t1];
    const gx1 = f(50 + Math.cos(spec.ga) * 50), gy1 = f(50 + Math.sin(spec.ga) * 50);
    const gx2 = f(50 - Math.cos(spec.ga) * 50), gy2 = f(50 - Math.sin(spec.ga) * 50);
    return {
      def: `<linearGradient id="${id}" x1="${gx1}%" y1="${gy1}%" x2="${gx2}%" y2="${gy2}%">` +
        `<stop offset="0" stop-color="${c0}"/>` +
        `<stop offset="1" stop-color="${mix(c0, c1, 0.85)}"/></linearGradient>`,
      body: `<path d="${path}" fill="url(#${id})"/>`,
    };
  }
  return { def: "", body: `<path d="${path}" fill="${tones[spec.t0]}"/>` };
}

// Assemble a field: a full-bleed base rect (overshooting every edge) is laid
// down first so overlaps never reveal gaps, then all blobs are painted on top.
function blobsField(base, specs, tones, bg, idPrefix) {
  let defs = "", body = "";
  for (let i = 0; i < specs.length; i++) {
    const s = blobsShape(specs[i], tones, bg, idPrefix, i);
    defs += s.def;
    body += s.body;
  }
  const baseRect = `<rect x="-60" y="-60" width="${W + 120}" height="${H + 120}" fill="${base}"/>`;
  return (defs ? `<defs>${defs}</defs>` : "") + baseRect + body;
}

const SET_blobs: Variation[] = [
  (p) => ({ background: p.bg, shapes: blobsField(mix(p.tones[0], p.bg, 0.5), [ { cx: 190, cy: 90, rx: 360, ry: 340, n: 8, spike: 0.16, seed: 11, grad: true, t0: 4, t1: 2, ga: 1.1 }, { cx: 1010, cy: 620, rx: 400, ry: 380, n: 8, spike: 0.18, seed: 27, grad: true, t0: 3, t1: 1, ga: 2.3 }, { cx: 620, cy: 340, rx: 300, ry: 300, n: 9, spike: 0.14, seed: 43, grad: true, t0: 2, t1: 0, ga: 0.4 }, { cx: 240, cy: 700, rx: 170, ry: 170, n: 7, spike: 0.22, seed: 59, grad: false, t0: 4 } ], p.tones, p.bg, "b0") }),
  (p) => ({ background: p.bg, shapes: blobsField(mix(p.tones[1], p.bg, 0.55), [ { cx: 0, cy: 0, rx: 560, ry: 560, n: 8, spike: 0.12, seed: 101, grad: false, t0: 2 }, { cx: 1200, cy: 130, rx: 520, ry: 500, n: 8, spike: 0.14, seed: 137, grad: false, t0: 4 }, { cx: 560, cy: 720, rx: 560, ry: 520, n: 9, spike: 0.13, seed: 173, grad: false, t0: 3 } ], p.tones, p.bg, "b1") }),
  (p) => ({ background: mix(p.tones[0], p.bg, 0.4), shapes: blobsField(mix(p.tones[0], p.bg, 0.4), [ { cx: 600, cy: 337, rx: 720, ry: 620, n: 10, spike: 0.10, seed: 201, grad: true, t0: 1, t1: -1, ga: 1.6 }, { cx: 600, cy: 337, rx: 500, ry: 430, n: 9, spike: 0.13, seed: 233, grad: true, t0: 2, t1: 1, ga: 0.9 }, { cx: 600, cy: 337, rx: 300, ry: 260, n: 9, spike: 0.16, seed: 271, grad: true, t0: 4, t1: 3, ga: 2.0 }, { cx: 600, cy: 337, rx: 140, ry: 130, n: 8, spike: 0.20, seed: 307, grad: false, t0: 4 } ], p.tones, p.bg, "b2") }),
  (p) => ({ background: mix(p.tones[0], p.bg, 0.6), shapes: blobsField(mix(p.tones[0], p.bg, 0.6), (() => { const rng = blobsRng(909); const arr = []; const cols = 4, rows = 3; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const cx = (c + 0.5) * (W / cols) + (rng() - 0.5) * 120; const cy = (r + 0.5) * (H / rows) + (rng() - 0.5) * 90; const rad = 150 + rng() * 90; arr.push({ cx, cy, rx: rad, ry: rad * (0.8 + rng() * 0.4), n: 7, spike: 0.28, seed: 400 + r * 10 + c, grad: false, t0: (r + c) % 5 }); } return arr; })(), p.tones, p.bg, "b3") }),
  (p) => ({ background: mix(p.tones[1], p.bg, 0.5), shapes: blobsField(mix(p.tones[1], p.bg, 0.5), [ { cx: 120, cy: 620, rx: 480, ry: 300, n: 8, spike: 0.15, seed: 501, grad: true, t0: 4, t1: 2, ga: 0.6 }, { cx: 520, cy: 400, rx: 460, ry: 290, n: 8, spike: 0.16, seed: 541, grad: true, t0: 3, t1: 1, ga: 0.6 }, { cx: 920, cy: 180, rx: 480, ry: 300, n: 8, spike: 0.15, seed: 587, grad: true, t0: 2, t1: 0, ga: 0.6 }, { cx: 1120, cy: 560, rx: 220, ry: 180, n: 7, spike: 0.24, seed: 613, grad: false, t0: 4 } ], p.tones, p.bg, "b4") }),
  (p) => ({ background: mix(p.tones[2], p.bg, 0.35), shapes: blobsField(mix(p.tones[2], p.bg, 0.35), [ { cx: 300, cy: 760, rx: 780, ry: 680, n: 9, spike: 0.11, seed: 701, grad: true, t0: 3, t1: 1, ga: 1.8 }, { cx: 980, cy: 220, rx: 340, ry: 340, n: 9, spike: 0.13, seed: 743, grad: true, t0: 4, t1: 2, ga: 0.3 }, { cx: 1080, cy: 150, rx: 120, ry: 120, n: 8, spike: 0.18, seed: 787, grad: false, t0: 0 } ], p.tones, p.bg, "b5") })
];

// ---- set: ridgeline — Overlapping paper-cut mountain silhouettes receding into a soft gradient sky, back ridges quiet and high, front ridges saturated and low, for a serene layered-depth feel. ----
function ridgelineRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ridgelinePath(baseY, amp, rough, seed, tilt) {
  const rnd = ridgelineRng(seed);
  const oct = [
    { fr: 1, ph: rnd() * 6.283 },
    { fr: 2.3, ph: rnd() * 6.283 },
    { fr: 4.1, ph: rnd() * 6.283 },
    { fr: 7.7, ph: rnd() * 6.283 },
  ];
  const wt = [1, 0.5 * rough, 0.28 * rough, 0.14 * rough];
  const norm = wt[0] + wt[1] + wt[2] + wt[3];
  const x0 = -140;
  const x1 = W + 140;
  const steps = 52;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    const u = (x / W) * 6.283;
    let y = 0;
    for (let k = 0; k < oct.length; k++) y += wt[k] * Math.sin(oct[k].fr * u + oct[k].ph);
    y = (y / norm) * amp + tilt * ((x - W / 2) / W) * amp;
    d += (i === 0 ? "M" : " L") + f(x) + "," + f(baseY + y);
  }
  d += " L" + f(x1) + "," + f(H + 90) + " L" + f(x0) + "," + f(H + 90) + " Z";
  return d;
}

function ridgelineScene(p, o) {
  const { count, horizon, amp, rough, ramp, sun, seed } = o;
  const tones = p.tones;
  const uid = "rl" + (seed >>> 0).toString(36);
  const skyTop = ramp > 0 ? mix(p.bg, tones[0], 0.5) : mix(p.bg, tones[1], 0.35);
  const skyBot = ramp > 0 ? mix(p.bg, tones[1], 0.65) : mix(p.bg, tones[0], 0.6);
  let s =
    '<defs><linearGradient id="' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="' + skyTop + '"/>' +
    '<stop offset="1" stop-color="' + skyBot + '"/></linearGradient></defs>';
  s += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="url(#' + uid + ')"/>';
  if (sun) {
    const sr = Math.round(64 + (seed % 9) * 7);
    const sx = Math.round(W * (0.22 + ((seed % 7) / 7) * 0.56));
    const sy = Math.round(horizon - amp * 0.4);
    const sunTone = ramp > 0 ? tones[4] : tones[3];
    s +=
      '<circle cx="' + sx + '" cy="' + sy + '" r="' + sr + '" fill="' +
      mix(skyBot, sunTone, 0.7) + '"/>';
  }
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    const idx = ramp > 0 ? Math.round(t * 4) : Math.round((1 - t) * 4);
    const baseY = horizon + (H - horizon) * Math.pow(t, 0.92) * 0.9;
    const layerAmp = amp * (0.45 + 0.75 * t);
    const tilt = (i % 2 ? 1 : -1) * (0.25 + 0.6 * t);
    const fill = tones[Math.max(0, Math.min(4, idx))];
    s += '<path d="' + ridgelinePath(baseY, layerAmp, rough, seed + i * 137 + 7, tilt) + '" fill="' + fill + '"/>';
  }
  return s;
}

const SET_ridgeline: Variation[] = [
  (p) => ({ background: p.bg, shapes: ridgelineScene(p, { count: 6, horizon: 190, amp: 46, rough: 1, ramp: 1, sun: true, seed: 11 }) }),
  (p) => ({ background: p.bg, shapes: ridgelineScene(p, { count: 5, horizon: 155, amp: 62, rough: 1.5, ramp: 1, sun: false, seed: 29 }) }),
  (p) => ({ background: p.bg, shapes: ridgelineScene(p, { count: 7, horizon: 125, amp: 34, rough: 0.65, ramp: 1, sun: false, seed: 41 }) }),
  (p) => ({ background: p.bg, shapes: ridgelineScene(p, { count: 5, horizon: 215, amp: 54, rough: 1.15, ramp: -1, sun: true, seed: 58 }) }),
  (p) => ({ background: p.bg, shapes: ridgelineScene(p, { count: 4, horizon: 250, amp: 74, rough: 1.7, ramp: 1, sun: true, seed: 73 }) }),
  (p) => ({ background: p.bg, shapes: ridgelineScene(p, { count: 6, horizon: 165, amp: 44, rough: 0.85, ramp: 1, sun: false, seed: 97 }) })
];

// ---- set: sunburst — Bold vintage sunbeam covers of alternating-tone wedges radiating from a focal point past every edge, with optional concentric ring accents and a central disc. ----
// ---- shared geometry: emit N wedges sweeping a full circle from (cx,cy) ----
// R must exceed the canvas diagonal (~1378) so every ray overshoots all edges.
function sunburstWedges(cx, cy, n, R, startDeg, spinDeg, tones, idxFn) {
  let s = "";
  const step = 360 / n;
  for (let i = 0; i < n; i++) {
    // slight per-ray pinwheel skew: spinDeg twists the leading edge
    const a0 = (startDeg + i * step) * Math.PI / 180;
    const a1 = (startDeg + (i + 1) * step + spinDeg) * Math.PI / 180;
    const x0 = f(cx + R * Math.cos(a0));
    const y0 = f(cy + R * Math.sin(a0));
    const x1 = f(cx + R * Math.cos(a1));
    const y1 = f(cy + R * Math.sin(a1));
    const fill = tones[idxFn(i, n)];
    s += poly(`${f(cx)},${f(cy)} ${x0},${y0} ${x1},${y1}`, fill);
  }
  return s;
}

// concentric ring accents drawn as stroked circles centered at focal point
function sunburstRings(cx, cy, count, step, r0, stroke, w) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const r = f(r0 + i * step);
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${w}"/>`;
  }
  return s;
}

// solid central disc, optionally with a thin ring outline
function sunburstDisc(cx, cy, r, fill, ring) {
  let s = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fill}"/>`;
  if (ring) s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="${ring.c}" stroke-width="${ring.w}"/>`;
  return s;
}

// two-tone alternation
function sunburstTwo(a, b) { return (i) => (i % 2 === 0 ? a : b); }
// forward cycle through a tone list
function sunburstCycle(list) { return (i) => list[i % list.length]; }

const SET_sunburst: Variation[] = [
  (p) => ({ background: p.bg, shapes: sunburstWedges(600, 337.5, 24, 1500, 0, 0, p.tones, sunburstTwo(4, 1)) + sunburstRings(600, 337.5, 3, 70, 90, mix(p.tones[4], p.bg, 0.35), 6) + sunburstDisc(600, 337.5, 70, p.tones[0], { c: p.tones[4], w: 6 }) }),
  (p) => ({ background: p.bg, shapes: sunburstWedges(0, 0, 20, 1600, 0, 0, p.tones, sunburstTwo(3, 0)) + sunburstRings(0, 0, 4, 140, 200, mix(p.tones[4], p.bg, 0.4), 5) }),
  (p) => ({ background: p.bg, shapes: sunburstWedges(1200, 675, 32, 1650, 0, 5.6, p.tones, sunburstCycle([1, 4, 2, 4])) }),
  (p) => ({ background: p.bg, shapes: sunburstWedges(600, 337.5, 30, 1500, 0, 0, p.tones, sunburstCycle([0, 2, 4, 2])) + sunburstDisc(600, 337.5, 120, mix(p.tones[4], p.bg, 0.15), { c: p.tones[3], w: 10 }) }),
  (p) => ({ background: p.bg, shapes: sunburstWedges(300, 640, 22, 1650, 0, 3.5, p.tones, sunburstTwo(4, 2)) + sunburstRings(300, 640, 3, 110, 140, mix(p.tones[3], p.bg, 0.3), 7) }),
  (p) => ({ background: p.bg, shapes: sunburstWedges(920, 130, 40, 1700, 0, 0, p.tones, sunburstCycle([4, 3, 1, 0, 1, 3])) })
];

// ---- set: scatter — A lively, balanced field of small geometric confetti — dots, rounded squares, triangles, plus-signs, rings, and short dashes — deterministically scattered edge to edge with cycling palette tones over a plain or faintly gradient base. ----
// mulberry32 PRNG — pure, deterministic, seeded by an integer literal.
function scatterRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A single confetti glyph centered at (cx,cy), rotated `rot` degrees, sized `s`.
// `kind` (0..5) picks the shape; `fill` comes from the palette.
function scatterGlyph(kind, cx, cy, s, rot, fill, strokeW) {
  const t = `rotate(${f(rot)} ${f(cx)} ${f(cy)})`;
  const k = ((kind % 6) + 6) % 6;
  if (k === 0) {
    return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(s * 0.5)}" fill="${fill}"/>`;
  }
  if (k === 1) {
    const d = s;
    return `<rect x="${f(cx - d / 2)}" y="${f(cy - d / 2)}" width="${f(d)}" height="${f(d)}" rx="${f(d * 0.22)}" fill="${fill}" transform="${t}"/>`;
  }
  if (k === 2) {
    const r = s * 0.62;
    const p = [0, 120, 240]
      .map((deg) => {
        const a = (Math.PI / 180) * (deg - 90);
        return `${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`;
      })
      .join(" ");
    return `<g transform="${t}">${poly(p, fill)}</g>`;
  }
  if (k === 3) {
    const arm = s * 0.5;
    const th = s * 0.28;
    return (
      `<g transform="${t}">` +
      `<rect x="${f(cx - th / 2)}" y="${f(cy - arm)}" width="${f(th)}" height="${f(arm * 2)}" rx="${f(th * 0.3)}" fill="${fill}"/>` +
      `<rect x="${f(cx - arm)}" y="${f(cy - th / 2)}" width="${f(arm * 2)}" height="${f(th)}" rx="${f(th * 0.3)}" fill="${fill}"/>` +
      `</g>`
    );
  }
  if (k === 4) {
    const len = s * 1.15;
    return `<line x1="${f(cx - len / 2)}" y1="${f(cy)}" x2="${f(cx + len / 2)}" y2="${f(cy)}" stroke="${fill}" stroke-width="${f(Math.max(2, strokeW))}" stroke-linecap="round" transform="${t}"/>`;
  }
  const rw = Math.max(2, s * 0.16);
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(s * 0.45)}" fill="none" stroke="${fill}" stroke-width="${f(rw)}"/>`;
}

// Core field: scatters confetti across an overshot bounding box so coverage
// runs edge to edge on all four sides. `opts` fully control the look, so every
// variation is a distinct configuration of the same style.
function scatterField(bg, tones, opts) {
  const { seed, step, jitter, sizeMin, sizeMax, kinds, toneIdx, rotate, quietChance } = opts;
  const rng = scatterRng(seed);
  const margin = Math.max(80, step);
  const cols = Math.ceil((W + 2 * margin) / step);
  const rows = Math.ceil((H + 2 * margin) / step);
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rng() < quietChance) {
        rng(); rng(); rng(); rng(); // keep the stream aligned for skipped cells
        continue;
      }
      const baseX = -margin + (c + 0.5) * step;
      const baseY = -margin + (r + 0.5) * step;
      const cx = baseX + (rng() - 0.5) * 2 * jitter * step;
      const cy = baseY + (rng() - 0.5) * 2 * jitter * step;
      const s = sizeMin + rng() * (sizeMax - sizeMin);
      const kind = kinds[Math.floor(rng() * kinds.length)];
      const tIdx = toneIdx[(r * 7 + c * 3 + Math.floor(rng() * toneIdx.length)) % toneIdx.length];
      const tone = tones[tIdx];
      const rot = rotate
        ? rng() * 360
        : kind === 2
          ? [0, 90, 180, 270][Math.floor(rng() * 4)]
          : 0;
      cells.push({ cx, cy, s, kind, tone, rot });
    }
  }
  // Draw larger forms first so small confetti reads on top → subtle depth.
  cells.sort((p, q) => q.s - p.s);
  let out = "";
  for (const cell of cells) {
    out += scatterGlyph(cell.kind, cell.cx, cell.cy, cell.s, cell.rot, cell.tone, cell.s * 0.14);
  }
  return out;
}

// Faint full-bleed diagonal gradient base (returns <defs>+<rect> at exactly WxH).
function scatterBase(bg, tones, id, angle) {
  const a = mix(bg, tones[0], 0.55);
  const rad = (Math.PI / 180) * angle;
  return (
    `<defs><linearGradient id="${id}" x1="${f(50 - 50 * Math.cos(rad))}%" y1="${f(50 - 50 * Math.sin(rad))}%" x2="${f(50 + 50 * Math.cos(rad))}%" y2="${f(50 + 50 * Math.sin(rad))}%">` +
    `<stop offset="0%" stop-color="${bg}"/>` +
    `<stop offset="100%" stop-color="${a}"/>` +
    `</linearGradient></defs>` +
    `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#${id})"/>`
  );
}

const SET_scatter: Variation[] = [
  (p) => ({ background: p.bg, shapes: scatterField(p.bg, p.tones, { seed: 1337, step: 92, jitter: 0.38, sizeMin: 16, sizeMax: 44, kinds: [0, 1, 2, 3, 4, 5], toneIdx: [1, 2, 3, 4], rotate: true, quietChance: 0.06 }) }),
  (p) => ({ background: p.bg, shapes: scatterField(p.bg, p.tones, { seed: 24601, step: 62, jitter: 0.3, sizeMin: 9, sizeMax: 24, kinds: [0, 3, 5, 4], toneIdx: [0, 1, 2, 3], rotate: true, quietChance: 0.05 }) }),
  (p) => ({ background: p.bg, shapes: scatterBase(p.bg, p.tones, 'scatterG2', 25) + scatterField(p.bg, p.tones, { seed: 7, step: 148, jitter: 0.14, sizeMin: 34, sizeMax: 72, kinds: [0, 1, 2, 5], toneIdx: [2, 3, 4], rotate: true, quietChance: 0.03 }) }),
  (p) => ({ background: p.bg, shapes: scatterField(p.bg, p.tones, { seed: 90210, step: 84, jitter: 0.42, sizeMin: 18, sizeMax: 50, kinds: [2, 2, 1, 3, 0], toneIdx: [1, 3, 4], rotate: true, quietChance: 0.08 }) }),
  (p) => ({ background: p.bg, shapes: scatterField(p.bg, p.tones, { seed: 555, step: 78, jitter: 0.22, sizeMin: 14, sizeMax: 38, kinds: [0, 1, 3, 5], toneIdx: [0, 1, 2, 3, 4], rotate: false, quietChance: 0.05 }) }),
  (p) => ({ background: p.bg, shapes: scatterBase(p.bg, p.tones, 'scatterG5', 200) + scatterField(p.bg, p.tones, { seed: 31415, step: 108, jitter: 0.45, sizeMin: 22, sizeMax: 58, kinds: [4, 4, 0, 5, 2], toneIdx: [2, 3, 4], rotate: true, quietChance: 0.04 }) })
];

// ---------------------------------------------------------------------------
// Set registry. Order + names are validated against COVER_SETS so the generated
// files line up with what the runtime asks for.
// ---------------------------------------------------------------------------

type CoverSetDef = { name: string; variations: Variation[] };

const SETS: CoverSetDef[] = [
  { name: "tessellation", variations: SET_tessellation },
  { name: "gradient-mesh", variations: SET_gradient_mesh },
  { name: "waves", variations: SET_waves },
  { name: "rings", variations: SET_rings },
  { name: "halftone", variations: SET_halftone },
  { name: "blobs", variations: SET_blobs },
  { name: "ridgeline", variations: SET_ridgeline },
  { name: "sunburst", variations: SET_sunburst },
  { name: "scatter", variations: SET_scatter },
];

// Keep the generator and the runtime registry in lockstep: same sets, same
// order, same variant count. A mismatch means covers/<theme>-<set>-<n>.png files
// won't line up with what src/lib/covers.ts asks for at runtime.
if (SETS.length !== COVER_SETS.length || SETS.some((s, i) => s.name !== COVER_SETS[i])) {
  throw new Error(
    `SETS (${SETS.map((s) => s.name).join(", ")}) must match COVER_SETS ` +
      `(${COVER_SETS.join(", ")}) exactly and in order.`,
  );
}
for (const s of SETS) {
  if (s.variations.length !== VARIANTS_PER_SET) {
    throw new Error(
      `Set "${s.name}" has ${s.variations.length} variations; expected ${VARIANTS_PER_SET}.`,
    );
  }
}

function svgFor(palette: Palette, variation: Variation): string {
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

type ThemeLike = {
  name: string;
  colors: {
    background: string;
    primary: string;
    foreground: string;
    secondary?: string;
    accent?: string;
  };
};

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

  // Clean stale PNGs so renamed/removed sets don't leave orphans behind.
  for (const file of await readdir(OUT_DIR)) {
    if (file.endsWith(".png")) await rm(path.join(OUT_DIR, file));
  }

  const perTheme = SETS.length * VARIANTS_PER_SET;
  let count = 0;
  for (const theme of themes) {
    const palette = paletteFor(theme.colors);
    for (const set of SETS) {
      for (let i = 0; i < set.variations.length; i++) {
        const svg = svgFor(palette, set.variations[i]);
        // Palette-quantized PNGs (with dithering) keep these decorative patterns
        // visually identical while shrinking the smooth-gradient sets ~4x — key
        // to keeping 810 committed covers to a sane repo footprint.
        const png = await sharp(Buffer.from(svg))
          .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
          .toBuffer();
        await writeFile(path.join(OUT_DIR, `${theme.name}-${set.name}-${i}.png`), png);
        count++;
      }
    }
    console.log(`  ${theme.name}: ${SETS.length} sets x ${VARIANTS_PER_SET} = ${perTheme} covers`);
  }

  console.log(
    `Generated ${count} cover${count === 1 ? "" : "s"} — ${SETS.length} sets x ` +
      `${VARIANTS_PER_SET} variants across ${themes.length} theme` +
      `${themes.length === 1 ? "" : "s"} in ${path.relative(ROOT, OUT_DIR)}/`,
  );
}

await main();

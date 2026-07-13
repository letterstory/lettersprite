/**
 * Branded Open Graph card renderer, shared by every `opengraph-image` route.
 *
 * Link unfurls (Slack, iMessage, X, LinkedIn, Facebook, Discord…) show the
 * `og:image`. Article routes already advertise their cover image; this module
 * gives the *chromeless* routes — the homepage and each section index — a
 * generated card so a shared link is never a bare, image-less preview.
 *
 * The card is drawn from the active theme so it matches the publication: the
 * hero gradient as the field, the display font for the headline, and a readable
 * text color picked from the gradient's luminance. Fonts are fetched from Google
 * Fonts at build time and the whole load is best-effort — if the network is
 * unavailable the card still renders in `next/og`'s bundled default font, so a
 * build never fails for the sake of an OG image.
 */
import { ImageResponse } from "next/og";
import { env } from "@/env";
import { getActiveTheme } from "@/themes";
import type { FontSpec, Theme } from "@/themes/types";

/** OG's sweet-spot ratio (1.91:1): fills a preview card without cropping. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

/** Weights the css2 API (and Satori) accept. */
type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

type FontEntry = {
  name: string;
  data: ArrayBuffer;
  weight: Weight;
  style: "normal";
};

// --- color helpers ---------------------------------------------------------

type RGB = { r: number; g: number; b: number };

function parseHex(hex: string): RGB {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Relative luminance (0 dark → 1 light), sRGB approximation. */
function luminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Text tones that stay legible on the gradient, light-on-dark or dark-on-light. */
function readableTones(from: string, to: string) {
  const avg = (luminance(from) + luminance(to)) / 2;
  const dark = avg > 0.62;
  return {
    fg: dark ? "#12121a" : "#ffffff",
    muted: dark ? "rgba(15,15,26,0.72)" : "rgba(255,255,255,0.82)",
  };
}

// --- font loading (best-effort) --------------------------------------------

const displaySpec = (theme: Theme): FontSpec =>
  theme.fonts.display ?? theme.fonts.heading;

const maxWeight = (spec: FontSpec, fallback: number): number =>
  spec.google && spec.google.weights.length
    ? Math.max(...spec.google.weights)
    : fallback;

/** A weight suited to running text: the lightest declared >= 500, else lightest. */
const textWeight = (spec: FontSpec, fallback: number): number => {
  const w = spec.google?.weights;
  if (!w || !w.length) return fallback;
  const sorted = [...w].sort((a, b) => a - b);
  return sorted.find((x) => x >= 500) ?? sorted[0];
};

/**
 * Fetch one Google font face as raw ttf/otf, subset to `text`. Node's default
 * user agent makes the css2 API serve TrueType (Satori can't parse woff2), and
 * `force-cache` keeps this a build-time fetch so the route stays static. Returns
 * null on any failure, never throws.
 */
async function fetchGoogleFont(
  name: string,
  weight: number,
  text: string,
): Promise<ArrayBuffer | null> {
  try {
    const family = name.replace(/ /g, "+");
    const url =
      `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}` +
      (text ? `&text=${encodeURIComponent(text)}` : "");
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const css = await res.text();
    const match = css.match(
      /src:\s*url\((https:\/\/[^)]+)\)\s*format\('(?:truetype|opentype)'\)/,
    );
    if (!match) return null;
    const font = await fetch(match[1], { cache: "force-cache" });
    if (!font.ok) return null;
    return await font.arrayBuffer();
  } catch {
    return null;
  }
}

type FontReq = { name?: string; weight: number; text: string };

/** Load the requested faces, de-duplicated by family+weight, dropping failures. */
async function loadFonts(reqs: FontReq[]): Promise<FontEntry[]> {
  const byKey = new Map<string, { name: string; weight: number; text: string }>();
  for (const r of reqs) {
    if (!r.name) continue;
    const key = `${r.name}@${r.weight}`;
    const prev = byKey.get(key);
    byKey.set(key, { name: r.name, weight: r.weight, text: (prev?.text ?? "") + r.text });
  }
  const loaded = await Promise.all(
    [...byKey.values()].map(async ({ name, weight, text }) => {
      const data = await fetchGoogleFont(name, weight, text);
      return data
        ? { name, data, weight: weight as Weight, style: "normal" as const }
        : null;
    }),
  );
  return loaded.filter((f): f is FontEntry => f !== null);
}

// --- card -------------------------------------------------------------------

/** Headline size that keeps long titles on the card without shrinking short ones. */
function titleSize(title: string): number {
  const n = title.length;
  if (n <= 10) return 104;
  if (n <= 18) return 90;
  if (n <= 28) return 76;
  if (n <= 44) return 62;
  return 52;
}

/** The bare host of the site URL, e.g. "thesignal.example" — the footer mark. */
function siteHost(): string {
  return env.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export interface OgCardOptions {
  /** The headline: the site title on the home card, the section on a section card. */
  title: string;
  /** Small uppercased eyebrow above the empty field (masthead / tagline). */
  eyebrow?: string;
  /** One supporting line under the headline. */
  subtitle?: string;
  /** Overrides the footer mark (defaults to the site host). */
  footer?: string;
  /** Overrides the active theme (defaults to the deployment's theme). */
  theme?: Theme;
}

/**
 * Build the `ImageResponse` for a branded card. Callers are the tiny
 * `opengraph-image` route modules, which just supply the copy.
 */
export async function ogCardResponse(opts: OgCardOptions): Promise<ImageResponse> {
  const theme = opts.theme ?? getActiveTheme();
  const c = theme.colors;
  const from = c.heroFrom ?? c.primary;
  const to = c.heroTo ?? c.accent ?? c.secondary ?? c.primary;
  const accent = c.accent ?? c.secondary ?? c.primaryForeground;
  const { fg, muted } = readableTones(from, to);
  const footer = opts.footer ?? siteHost();

  const dSpec = displaySpec(theme);
  const bSpec = theme.fonts.body;
  const dWeight = maxWeight(dSpec, 700);
  const bWeight = textWeight(bSpec, 400);

  const fonts = await loadFonts([
    { name: dSpec.google?.name, weight: dWeight, text: opts.title },
    {
      name: bSpec.google?.name,
      weight: bWeight,
      text: [opts.eyebrow, opts.subtitle, footer].filter(Boolean).join(" "),
    },
  ]);
  const loaded = (name?: string, weight?: number) =>
    name && fonts.some((f) => f.name === name && f.weight === weight)
      ? name
      : undefined;
  const displayFamily = loaded(dSpec.google?.name, dWeight);
  const bodyFamily = loaded(bSpec.google?.name, bWeight);

  const element = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "76px 80px",
        backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        color: fg,
        fontFamily: bodyFamily,
      }}
    >
      <div style={{ display: "flex" }}>
        {opts.eyebrow ? (
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: bWeight,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: muted,
              fontFamily: bodyFamily,
            }}
          >
            {opts.eyebrow}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            width: 76,
            height: 6,
            borderRadius: 3,
            marginBottom: 30,
            backgroundColor: accent,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: titleSize(opts.title),
            fontWeight: dWeight,
            lineHeight: 1.03,
            letterSpacing: "-0.02em",
            maxWidth: 1000,
            fontFamily: displayFamily,
          }}
        >
          {opts.title}
        </div>
        {opts.subtitle ? (
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: bWeight,
              lineHeight: 1.3,
              marginTop: 28,
              maxWidth: 900,
              color: muted,
              fontFamily: bodyFamily,
            }}
          >
            {opts.subtitle}
          </div>
        ) : null}
        {footer ? (
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: bWeight,
              letterSpacing: "0.03em",
              marginTop: 44,
              color: muted,
              fontFamily: bodyFamily,
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );

  return new ImageResponse(element, {
    ...OG_SIZE,
    ...(fonts.length ? { fonts } : {}),
  });
}

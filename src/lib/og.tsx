/**
 * Branded Open Graph card renderer, shared by every `opengraph-image` route.
 *
 * Link unfurls (Slack, iMessage, X, LinkedIn, Facebook, Discord…) show the
 * `og:image`. Article routes already advertise their cover image; this module
 * gives the *chromeless* routes — the homepage and each section index — a
 * generated card so a shared link is never a bare, image-less preview.
 *
 * The card is drawn from the active theme so it matches the publication. In
 * `logo` mode the site title is rendered in the theme's masthead treatment
 * (serif / boxed / mono / monogram / …), or the supplied `SITE_LOGO_SVG` is
 * embedded — giving every deployment a visually distinct card even when the
 * palette runs dark. Fonts are fetched from Google Fonts at build time and the
 * whole load is best-effort — if the network is unavailable the card still
 * renders in `next/og`'s bundled default font, so a build never fails for the
 * sake of an OG image.
 */
import { ImageResponse } from "next/og";
import { env } from "@/env";
import { getActiveTheme } from "@/themes";
import type { FontSpec, LogoStyle, Theme } from "@/themes/types";

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

// --- title / logo helpers --------------------------------------------------

/**
 * Mirrors `mastheadTitle` in `src/components/Logo.tsx`: many titles are
 * "Brand: descriptive tagline" — the whole string swamps a wordmark. Take the
 * part before the first strong separator so the OG mark reads as a clean brand.
 */
function mastheadTitle(full: string): string {
  const brand = full.split(/:\s|\s+[—–|]\s+|\s+-\s+/)[0]?.trim();
  return brand || full;
}

/** Two-letter (or single-word two-char) initials for `monogram` themes. */
function initials(title: string): string {
  const words = title
    .replace(/^(the|a|an)\s+/i, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return title.trim().slice(0, 2).toUpperCase() || "·";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** The wordmark text for the `mono` logo (matches Logo.tsx's treatment). */
function monoWordmark(title: string): string {
  return title.replace(/\s+/g, "_").toLowerCase();
}

/**
 * Neutralize the two SVG-specific script vectors before we inline a supplied
 * `SITE_LOGO_SVG`. Same policy as `src/components/Logo.tsx`.
 */
function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

/** Turn a raw SVG string into a data URI suitable for Satori's `<img>` src. */
function svgDataUri(svg: string): string {
  const cleaned = sanitizeSvg(svg).replace(/\s+/g, " ").trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
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

/** The font face (and its weight) each logo style renders in. */
function logoFontFor(
  theme: Theme,
  style: LogoStyle,
): { spec: FontSpec; weight: number } {
  switch (style) {
    case "serif":
    case "underline":
      return { spec: displaySpec(theme), weight: 800 };
    case "mono":
      return { spec: theme.fonts.mono, weight: 700 };
    case "sans-bold":
    case "condensed":
    case "boxed":
    case "monogram":
    default:
      return { spec: theme.fonts.heading, weight: 700 };
  }
}

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

/** Logo size — larger than plain titles because the mark IS the composition. */
function logoSize(title: string, style: LogoStyle): number {
  const n = title.length;
  // `condensed` and `boxed` render UPPERCASE, so they occupy more width per glyph.
  const wide = style === "condensed" || style === "boxed";
  // `mono` wordmark reads as `/name_underscored.` — always longer than the source.
  const long = style === "mono";
  if (long) {
    if (n <= 8) return 120;
    if (n <= 14) return 100;
    if (n <= 22) return 80;
    return 64;
  }
  if (wide) {
    if (n <= 8) return 148;
    if (n <= 14) return 118;
    if (n <= 22) return 92;
    if (n <= 32) return 72;
    return 58;
  }
  if (n <= 8) return 168;
  if (n <= 14) return 134;
  if (n <= 22) return 104;
  if (n <= 32) return 82;
  return 64;
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
  /**
   * Render `title` in the theme's masthead logo treatment (serif/boxed/mono/…)
   * or embed the supplied `SITE_LOGO_SVG`. Meant for the homepage card, where
   * the title is the site name — makes every deployment's card look distinct.
   */
  logo?: boolean;
}

/**
 * Render the theme's masthead treatment as the OG card's centerpiece. Same
 * palette + typography choices as `src/components/Logo.tsx`, translated to
 * Satori-compatible JSX (no Tailwind, no pseudo-elements, everything laid out
 * with flex + explicit sizes).
 */
function LogoMark({
  style,
  title,
  fg,
  primary,
  primaryForeground,
  fontFamily,
  fontWeight,
  size,
  radius,
}: {
  style: LogoStyle;
  title: string;
  fg: string;
  primary: string;
  primaryForeground: string;
  fontFamily?: string;
  fontWeight: number;
  size: number;
  radius: string;
}): React.ReactElement {
  const fam = fontFamily ? { fontFamily } : {};

  switch (style) {
    case "serif":
      return (
        <div
          style={{
            display: "flex",
            fontSize: size,
            fontWeight,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            color: fg,
            ...fam,
          }}
        >
          {title}
        </div>
      );

    case "sans-bold":
      return (
        <div
          style={{
            display: "flex",
            fontSize: size,
            fontWeight,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: fg,
            ...fam,
          }}
        >
          {title}
        </div>
      );

    case "condensed":
      return (
        <div
          style={{
            display: "flex",
            fontSize: size,
            fontWeight,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            lineHeight: 1,
            color: fg,
            ...fam,
          }}
        >
          {title}
        </div>
      );

    case "mono": {
      const word = monoWordmark(title);
      const cursorW = Math.round(size * 0.42);
      const cursorH = Math.round(size * 0.92);
      return (
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            fontSize: size,
            fontWeight,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            color: fg,
            ...fam,
          }}
        >
          <span style={{ color: primary }}>/</span>
          <span>{word}</span>
          <span
            style={{
              display: "flex",
              width: cursorW,
              height: cursorH,
              marginLeft: Math.round(size * 0.08),
              backgroundColor: primary,
            }}
          />
        </div>
      );
    }

    case "boxed":
      return (
        <div
          style={{
            display: "flex",
            backgroundColor: primary,
            color: primaryForeground,
            padding: `${Math.round(size * 0.16)}px ${Math.round(size * 0.28)}px`,
            fontSize: size,
            fontWeight,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            ...fam,
          }}
        >
          {title}
        </div>
      );

    case "underline":
      return (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: size,
              fontWeight,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              color: fg,
              ...fam,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              height: Math.max(8, Math.round(size * 0.07)),
              width: Math.round(size * 2.4),
              marginTop: Math.round(size * 0.14),
              backgroundColor: primary,
            }}
          />
        </div>
      );

    case "monogram": {
      const init = initials(title);
      const tile = Math.round(size * 1.15);
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: tile,
              height: tile,
              backgroundColor: primary,
              color: primaryForeground,
              fontSize: Math.round(size * 0.68),
              fontWeight,
              borderRadius: radius,
              ...fam,
            }}
          >
            {init}
          </div>
          <div
            style={{
              display: "flex",
              marginLeft: Math.round(size * 0.22),
              fontSize: size,
              fontWeight,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              color: fg,
              ...fam,
            }}
          >
            {title}
          </div>
        </div>
      );
    }
  }
}

/** Rough px-length of an SVG intrinsic width for aspect-ratio scaling. */
function svgAspectRatio(svg: string): number | null {
  const vb = svg.match(/viewBox\s*=\s*["']([-\d.\s]+)["']/i);
  if (vb) {
    const parts = vb[1].trim().split(/\s+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) return parts[2] / parts[3];
  }
  const w = svg.match(/\bwidth\s*=\s*["']([\d.]+)/i);
  const h = svg.match(/\bheight\s*=\s*["']([\d.]+)/i);
  if (w && h && Number(h[1]) > 0) return Number(w[1]) / Number(h[1]);
  return null;
}

/** Convert a CSS length like "0.5rem" or "12px" into a Satori-friendly px value. */
function cssLengthToPx(value: string, base = 16): number {
  const m = value.trim().match(/^([\d.]+)(rem|px)?$/i);
  if (!m) return base;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return base;
  return (m[2] ?? "").toLowerCase() === "px" ? n : n * base;
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
  const footer = opts.footer ?? siteHost();
  const radius = `${cssLengthToPx(theme.radius)}px`;

  const useLogo = !!opts.logo;
  const useSvgLogo = useLogo && !!env.logoSvg;
  const brand = useLogo ? mastheadTitle(opts.title) : opts.title;

  // Logo mode paints the card on `background` — the ground the letterstory
  // wordmark and the theme's `primary`/`accent` decorations are authored
  // against — so an SVG in `primary` never blends into a hero gradient that
  // also starts at `primary`. Non-logo (section) cards keep the hero gradient
  // and derive text tones by luminance for legibility over either stop.
  const gradientTones = readableTones(from, to);
  const fg = useLogo ? c.foreground : gradientTones.fg;
  const muted = useLogo ? c.muted : gradientTones.muted;
  const primaryForeground = c.primaryForeground ?? fg;

  const bSpec = theme.fonts.body;
  const bWeight = textWeight(bSpec, 400);

  const logoStyle = theme.logo;
  const logoFont = logoFontFor(theme, logoStyle);
  const lWeight = maxWeight(logoFont.spec, logoFont.weight);

  // Characters we need in the logo face. The logo may render uppercased
  // (condensed, boxed), initials-only (monogram), or lowercased with `/_.`
  // (mono) — subset every form we might paint so Google Fonts serves complete
  // glyphs no matter which theme this deployment picked.
  const logoText =
    useLogo && !useSvgLogo
      ? brand + brand.toUpperCase() + brand.toLowerCase() + initials(brand) + "/_."
      : "";

  // Non-logo title uses the display face; logo mode uses the style-specific one.
  const dSpec = displaySpec(theme);
  const dWeight = maxWeight(dSpec, 700);

  const fonts = await loadFonts([
    ...(useLogo && !useSvgLogo
      ? [{ name: logoFont.spec.google?.name, weight: lWeight, text: logoText }]
      : []),
    ...(useLogo
      ? []
      : [{ name: dSpec.google?.name, weight: dWeight, text: opts.title }]),
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
  const logoFamily = loaded(logoFont.spec.google?.name, lWeight);

  // Only set `fontFamily` when the face actually loaded. A build-time Google
  // Fonts fetch can flake, leaving these undefined — and Satori throws
  // "Cannot read properties of undefined (reading 'split')" on a bare
  // `fontFamily: undefined`, which fails the whole static export. Omitting the
  // key instead lets Satori fall back to its bundled default font.
  const fam = (name?: string): { fontFamily?: string } => (name ? { fontFamily: name } : {});

  // Fit the embedded logo inside the card's content area (padding 80x76 →
  // ~1040x478). Wordmarks from letterstory can be very wide (6:1, 8:1); scale
  // by whichever axis binds first so the mark never overflows or crops.
  const svgMaxW = 900;
  const svgMaxH = 240;
  const svgAr = useSvgLogo ? svgAspectRatio(env.logoSvg) ?? 3 : 1;
  const svgH = Math.min(svgMaxH, svgMaxW / svgAr);
  const svgW = svgH * svgAr;

  const headline = useSvgLogo ? (
    <img
      src={svgDataUri(env.logoSvg)}
      width={svgW}
      height={svgH}
      alt=""
    />
  ) : useLogo ? (
    <LogoMark
      style={logoStyle}
      title={brand}
      fg={fg}
      primary={c.primary}
      primaryForeground={primaryForeground}
      fontFamily={logoFamily}
      fontWeight={lWeight}
      size={logoSize(brand, logoStyle)}
      radius={radius}
    />
  ) : (
    <div
      style={{
        display: "flex",
        fontSize: titleSize(opts.title),
        fontWeight: dWeight,
        lineHeight: 1.03,
        letterSpacing: "-0.02em",
        maxWidth: 1000,
        ...fam(displayFamily),
      }}
    >
      {opts.title}
    </div>
  );

  const element = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "76px 80px",
        ...(useLogo
          ? { backgroundColor: c.background }
          : { backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }),
        color: fg,
        ...fam(bodyFamily),
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
              ...fam(bodyFamily),
            }}
          >
            {opts.eyebrow}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {useLogo ? null : (
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
        )}
        {headline}
        {opts.subtitle ? (
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: bWeight,
              lineHeight: 1.3,
              marginTop: useLogo ? 40 : 28,
              maxWidth: 900,
              color: muted,
              ...fam(bodyFamily),
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
              ...fam(bodyFamily),
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

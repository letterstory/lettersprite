/**
 * Favicon selection.
 *
 * One codebase is deployed many times, each instance differentiated only by its
 * environment. Rather than ship a single favicon (or fall back to the framework
 * default), we keep a set of icons in `public/icons/` and pick one per
 * deployment.
 *
 * The pick is a hash of the site name, so it is stable: a given `SITE_TITLE`
 * always resolves to the same icon on every request and every rebuild, while
 * different deployments get visually distinct favicons for free.
 *
 * Drop a new `.svg`/`.png` into `public/icons/` and it joins the rotation — no
 * code changes needed.
 */

import { readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { env } from "@/env";
import { getActiveTheme } from "@/themes";

/** Directory holding the selectable favicons, served at `/icons/*`. */
const ICONS_DIR = join(process.cwd(), "public", "icons");

/** File extensions we treat as usable favicons, mapped to their MIME type. */
const ICON_TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
};

export type Favicon = { url: string; type?: string };

/**
 * Deterministic 32-bit FNV-1a hash. Pure and stable across processes and
 * rebuilds — the same string always yields the same number.
 */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** The available icon files in `public/icons`, sorted for a stable order. */
function listIcons(): string[] {
  try {
    return readdirSync(ICONS_DIR)
      .filter((name) => Boolean(ICON_TYPES[extname(name).toLowerCase()]))
      .sort();
  } catch {
    // No icons directory (or unreadable) — caller falls back to no icon.
    return [];
  }
}

/**
 * Choose a favicon for the given name (defaults to the site title). Returns a
 * public URL and MIME type, or `undefined` when no icons are available.
 */
export function pickFavicon(name: string = env.siteTitle): Favicon | undefined {
  const icons = listIcons();
  if (icons.length === 0) return undefined;
  const file = icons[hash(name) % icons.length];
  return {
    url: `/icons/${file}`,
    type: ICON_TYPES[extname(file).toLowerCase()],
  };
}

/**
 * The generated site logo (`SITE_LOGO_SVG`) as a favicon.
 *
 * The tab icon should match the mark the header renders. A rescramble or logo
 * regeneration in Letterbrace re-syncs `SITE_LOGO_SVG` and rebuilds this site,
 * so deriving the favicon from the same env var keeps the two in lockstep.
 * Inlined as a base64 data URL: no extra route or file, and a changed logo
 * changes the href — which also defeats the browser's sticky favicon cache.
 */
export function logoFavicon(): Favicon | undefined {
  const svg = env.logoSvg.trim();
  if (!svg) return undefined;
  return {
    url: `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`,
    type: "image/svg+xml",
  };
}

/** Minimal XML escape for a single character dropped into SVG text. */
function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** First letter of the site title (leading "The/A/An" stripped), uppercased. */
function siteInitial(): string {
  const cleaned = env.siteTitle.replace(/^(the|a|an)\s+/i, "").trim();
  const ch = cleaned[0] ?? env.siteTitle.trim()[0] ?? "·";
  return ch.toUpperCase();
}

/**
 * A generated, per-site branded favicon: the site's initial on a rounded tile
 * in the active theme's brand colour. Used when no `SITE_LOGO_SVG` is supplied,
 * so every deployment gets a distinct, on-brand tab icon — instead of one of a
 * handful of shared generic glyphs. Inlined as an SVG data URL (no asset
 * pipeline), and it always reflects the deployment's real theme colour, so a
 * rescramble that recolours the site recolours the tab icon too.
 */
export function brandFavicon(): Favicon {
  const { colors } = getActiveTheme();
  const bg = colors.primary || "#111111";
  const fg = colors.primaryForeground || "#ffffff";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="14" fill="${bg}"/>` +
    `<text x="50%" y="52%" dy=".35em" text-anchor="middle" ` +
    `font-family="system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif" ` +
    `font-weight="700" font-size="38" fill="${fg}">${xmlEscape(siteInitial())}</text>` +
    `</svg>`;
  return {
    url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    type: "image/svg+xml",
  };
}

/**
 * The deployment's tab favicon: the generated logo when one is set (matches the
 * header), otherwise a branded initial tile in the theme's colour — so every
 * site is individually branded, never a shared generic glyph.
 */
export function siteFavicon(): Favicon | undefined {
  return logoFavicon() ?? brandFavicon();
}

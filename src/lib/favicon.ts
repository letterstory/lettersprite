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

/** First letter of the site title (articles stripped) — matches the masthead. */
function siteInitial(): string {
  const clean = env.siteTitle.replace(/^(the|a|an)\s+/i, "").trim();
  return (clean[0] ?? env.siteTitle[0] ?? "·").toUpperCase();
}

/**
 * A favicon that matches the masthead: the site initial in white on a rounded
 * tile filled with the active theme's primary color. Built as an inline SVG
 * data URI so it needs no asset pipeline and always reflects the deployment's
 * real brand color (theme + industry + env overrides). This is what the browser
 * tab shows — so the tab, the header wordmark, and the brand all read as one.
 */
export function brandFavicon(): Favicon {
  const primary = getActiveTheme().colors.primary || "#111111";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="14" fill="${primary}"/>` +
    `<text x="50%" y="50%" dy=".35em" text-anchor="middle" ` +
    `font-family="Georgia,'Times New Roman',serif" font-weight="700" ` +
    `font-size="40" fill="#ffffff">${siteInitial()}</text></svg>`;
  return {
    url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    type: "image/svg+xml",
  };
}

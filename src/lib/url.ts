import { env } from "@/env";
import { coverImageFor } from "./covers";
import type { Post } from "./letterbrace/types";

/** Absolute URL for a site-relative path (or pass through an already-absolute one). */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${env.siteUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * XML-escape a URL for safe interpolation into sitemap.xml. Next's sitemap
 * serializer (resolve-route-data) drops `<loc>`/`<image:loc>` values in RAW, with
 * no escaping, so a cover URL carrying query params — e.g. an Unsplash hotlink
 * `?auto=format&fit=crop&w=1200&q=70` — emits bare `&` and makes the WHOLE
 * document unparseable ("EntityRef: expecting ';'"), which zeroes the sitemap in
 * Search Console. Escape the five XML entities (ampersand first) before handing a
 * URL to any sitemap field.
 */
export function xmlSafeUrl(url: string): string {
  return url
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Canonical absolute URL for a post. */
export function postUrl(post: Post): string {
  return `${env.siteUrl}/posts/${post.slug}`;
}

/**
 * Absolute cover image URL. `coverImageFor` returns a relative `/covers/*.png`
 * for the generated fallback; JSON-LD and sitemap images MUST be absolute, so
 * resolve it against the site URL here.
 */
export function absoluteCover(post: Post): string {
  return absoluteUrl(coverImageFor(post));
}

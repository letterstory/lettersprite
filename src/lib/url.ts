import { env } from "@/env";
import { coverImageFor } from "./covers";
import type { Post } from "./letterbrace/types";

/** Absolute URL for a site-relative path (or pass through an already-absolute one). */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${env.siteUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Canonical absolute URL for a post. */
export function postUrl(post: Post): string {
  return `${env.siteUrl}/posts/${post.slug}`;
}

/** Canonical absolute URL for the "Why companies choose X" page. */
export function whyPageUrl(): string {
  return `${env.siteUrl}/why`;
}

/**
 * Absolute cover image URL. `coverImageFor` returns a relative `/covers/*.png`
 * for the generated fallback; JSON-LD and sitemap images MUST be absolute, so
 * resolve it against the site URL here.
 */
export function absoluteCover(post: Post): string {
  return absoluteUrl(coverImageFor(post));
}

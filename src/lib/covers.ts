import { getActiveTheme } from "@/themes";
import type { Post } from "@/lib/letterbrace/types";
import { FALLBACK_COVER_DIR, FALLBACK_COVER_VARIANTS } from "./covers-config";

/**
 * Deterministic 32-bit FNV-1a hash. Stable across builds, platforms and Node
 * versions, so a given post name always maps to the same fallback cover.
 */
function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // 32-bit FNV prime; Math.imul keeps the multiply in 32-bit range.
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Path to a generated geometric-tessellation cover, used when Letterbrace
 * supplied no image. One of `FALLBACK_COVER_VARIANTS` variations is picked
 * deterministically from the post's name so the same post always gets the same
 * image, and the file is colored to match `themeName` (see
 * `scripts/generate-covers.mts`, which emits `covers/<theme>-<n>.png`).
 */
export function fallbackCover(name: string, themeName: string): string {
  const index = hashString(name) % FALLBACK_COVER_VARIANTS;
  return `/${FALLBACK_COVER_DIR}/${themeName}-${index}.png`;
}

/**
 * The cover image to render for a post: the one provided by Letterbrace, or a
 * theme-matched geometric tessellation fallback when none was provided. Always
 * returns a usable image URL, so callers can render a cover unconditionally.
 */
export function coverImageFor(post: Post): string {
  if (post.coverImage) return post.coverImage;
  return fallbackCover(post.title || post.slug, getActiveTheme().name);
}

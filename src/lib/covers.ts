import { getActiveTheme } from "@/themes";
import { env } from "@/env";
import type { Post } from "@/lib/letterbrace/types";
import {
  COVER_SETS,
  FALLBACK_COVER_DIR,
  VARIANTS_PER_SET,
} from "./covers-config";

/**
 * Deterministic 32-bit FNV-1a hash. Stable across builds, platforms and Node
 * versions, so a given string always maps to the same cover.
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
 * The single cover *set* this blog uses for every fallback cover. Chosen once,
 * deterministically, from the blog title — so each deployment gets its own
 * stable visual family (waves, sunburst, gradient mesh…) without any config,
 * yet the choice never drifts across rebuilds.
 */
const activeCoverSet = COVER_SETS[hashString(env.siteTitle) % COVER_SETS.length];

/**
 * Path to a generated cover, used when Letterbrace supplied no image. The blog's
 * set is fixed (`activeCoverSet`); within it, one of `VARIANTS_PER_SET`
 * variations is picked deterministically from the post's name so the same post
 * always gets the same image and different posts vary. The file is colored to
 * match `themeName` (see `scripts/generate-covers.mts`, which emits
 * `covers/<theme>-<set>-<n>.png`).
 */
export function fallbackCover(name: string, themeName: string): string {
  const variant = hashString(name) % VARIANTS_PER_SET;
  return `/${FALLBACK_COVER_DIR}/${themeName}-${activeCoverSet}-${variant}.png`;
}

/**
 * The cover image to render for a post: the one provided by Letterbrace, or a
 * theme-matched generated pattern fallback when none was provided. Always
 * returns a usable image URL, so callers can render a cover unconditionally.
 */
export function coverImageFor(post: Post): string {
  if (post.coverImage) return post.coverImage;
  return fallbackCover(post.title || post.slug, getActiveTheme().name);
}

/**
 * Alt text to pair with `coverImageFor`. A real cover gets the alt Letterbrace
 * shipped (falling back to the post title); the generated pattern fallback is
 * purely decorative, so it correctly stays `alt=""`.
 */
export function coverAltFor(post: Post): string {
  if (!post.coverImage) return "";
  return post.coverImageAlt ?? post.title ?? "";
}

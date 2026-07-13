/**
 * "Suggested reading" selection.
 *
 * Given the current post and the full set, pick a stable handful of other
 * stories to surface (related rail, "more in section", homepage promos).
 * Selection is deterministic and prefers posts that share a section, so the
 * suggestions feel curated rather than random while never changing per build.
 */

import { hashString } from "./rng";
import { sectionFor } from "./editorial";
import type { Post } from "./letterbrace/types";

/**
 * Up to `count` posts related to `post`, drawn first from the same section,
 * then filled from the rest. Ordered deterministically by a per-pair hash so
 * the same article always suggests the same reading.
 */
export function relatedPosts(post: Post, all: Post[], count = 3): Post[] {
  const others = all.filter((p) => p.id !== post.id);
  const section = sectionFor(post);
  const rank = (p: Post) => hashString(`${post.id}->${p.id}`);

  const sameSection = others
    .filter((p) => sectionFor(p) === section)
    .sort((a, b) => rank(a) - rank(b));
  const rest = others
    .filter((p) => sectionFor(p) !== section)
    .sort((a, b) => rank(a) - rank(b));

  return [...sameSection, ...rest].slice(0, count);
}

/**
 * A deterministic "editor's picks" set for the homepage rail — the highest-hash
 * posts, excluding any already shown up top. Stable across builds.
 */
export function editorsPicks(all: Post[], exclude: Post[] = [], count = 4): Post[] {
  const skip = new Set(exclude.map((p) => p.id));
  return all
    .filter((p) => !skip.has(p.id))
    .map((p) => ({ p, k: hashString(`pick:${p.id}`) }))
    .sort((a, b) => b.k - a.k)
    .slice(0, count)
    .map((x) => x.p);
}

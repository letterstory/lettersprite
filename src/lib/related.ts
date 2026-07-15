/**
 * "Suggested reading" selection.
 *
 * Given the current post and the full set, pick a stable handful of other
 * stories to surface (related rail, "more in section", homepage promos).
 * Selection is deterministic and prefers posts that share the most tags (then
 * the same section), so the suggestions feel curated rather than random while
 * never changing per build.
 */

import { hashString } from "./rng";
import { sectionFor } from "./editorial";
import type { Post } from "./letterbrace/types";

/** A post's tags as a lower-cased, trimmed set (for overlap counting). */
function tagSet(post: Post): Set<string> {
  return new Set(post.tags.map((t) => t.trim().toLowerCase()).filter(Boolean));
}

/**
 * Up to `count` posts related to `post`, ranked by how many tags they share
 * with it (most first), then by whether they sit in the same section, then
 * filled from the rest. Ties break on a per-pair hash so the same article
 * always suggests the same reading. Tag-driven relatedness means the pillar the
 * Planner assigns — plus any tags added by hand — genuinely steers the rail;
 * with a single tag this reduces to the previous same-section behavior.
 */
export function relatedPosts(post: Post, all: Post[], count = 3): Post[] {
  const others = all.filter((p) => p.id !== post.id);
  const tags = tagSet(post);
  const section = sectionFor(post);

  const shared = (p: Post) => {
    const t = tagSet(p);
    let n = 0;
    for (const tag of tags) if (t.has(tag)) n++;
    return n;
  };
  const rank = (p: Post) => hashString(`${post.id}->${p.id}`);

  return [...others]
    .map((p) => ({
      p,
      shared: shared(p),
      sameSection: sectionFor(p) === section ? 1 : 0,
      h: rank(p),
    }))
    .sort(
      (a, b) =>
        b.shared - a.shared || b.sameSection - a.sameSection || a.h - b.h,
    )
    .slice(0, count)
    .map((x) => x.p);
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

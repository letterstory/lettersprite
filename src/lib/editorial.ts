/**
 * Editorial metadata derived from a post: reading time, its publish date, and
 * a section label. Anything derived here is deterministic so it never changes
 * between builds — and nothing here is invented: a post the payload gives no
 * date shows no date.
 */

import { slugify, stripHtml } from "./letterbrace/normalize";
import type { Post } from "./letterbrace/types";

/** Words per minute used for the reading-time estimate. */
const WPM = 225;

/**
 * One shared catch-all section for posts with no tag of their own. A pool of
 * invented topics ("Ideas", "Thoughts", "Opinion"…) used to scatter tagless
 * posts across meaningless one-off hubs, fragmenting topical authority; a single
 * bucket keeps them out of the real topic hubs without inventing fake ones.
 */
const FALLBACK_SECTION = "Features";

/** Total word count of the article body. */
export function wordCount(post: Post): number {
  return stripHtml(post.content).split(/\s+/).filter(Boolean).length;
}

/** Estimated reading time in whole minutes (>= 1). */
export function readingTimeMinutes(post: Post): number {
  return Math.max(1, Math.round(wordCount(post) / WPM));
}

/** "6 min read" */
export function readingTimeLabel(post: Post): string {
  return `${readingTimeMinutes(post)} min read`;
}

/**
 * The publish date the payload gave, or null. Never synthesized: a made-up
 * dateline claims a back catalogue the site does not have, so an undated post
 * shows no date and its structured data omits `datePublished`.
 */
export function publishDate(post: Post): string | null {
  return post.createdAt;
}

/**
 * The one-time fleet re-pin (2026-07-30) that restamped every post's version
 * timestamp. `updatedAt` at or before this instant reflects that mass operation,
 * NOT an editorial revision — so we don't advertise it as a modification. Doing
 * so would put a "modified" date days after the publish date
 * and disagree with the sitemap `<lastmod>` and `datePublished`, the exact
 * inconsistency Google Search Console distrusts. Genuine edits after this cutoff
 * advance `dateModified` normally.
 */
const FLEET_REPIN_CUTOFF = "2026-07-31T00:00:00.000Z";

/** True when `updatedAt` represents a real post-publish edit worth advertising. */
function isGenuineEdit(post: Post): boolean {
  const published = publishDate(post);
  return Boolean(
    published &&
      post.updatedAt &&
      post.updatedAt > FLEET_REPIN_CUTOFF &&
      post.updatedAt > published,
  );
}

/**
 * The last-modified date to advertise: a real later `updatedAt` when the post
 * was genuinely edited (see {@link isGenuineEdit}), otherwise the publish date.
 * Keeping it equal to the publish date for un-edited posts makes `dateModified`,
 * the sitemap `<lastmod>`, and `datePublished` agree — one honest date, which is
 * what GSC rewards — and guarantees `dateModified >= datePublished`. Null for
 * an undated post, like its publish date.
 */
export function modifiedDate(post: Post): string | null {
  return isGenuineEdit(post) ? (post.updatedAt as string) : publishDate(post);
}

/**
 * Whether to show an "Updated" stamp. True only for a genuine post-publish edit,
 * so the stamp never fires for the fleet re-pin or an undated post.
 */
export function isUpdated(post: Post): boolean {
  return isGenuineEdit(post);
}

/** Words past which a piece reads as a "long read" (worth a badge). */
const LONGREAD_WORDS = 1800;

/** True for substantial features (used to flag a "Long read" badge). */
export function isLongread(post: Post): boolean {
  return wordCount(post) >= LONGREAD_WORDS;
}

/**
 * The "edition" dateline for the masthead — the date of the most recent story,
 * so it's meaningful and deterministic (never a build-time wall-clock read).
 * Null when no post is dated.
 */
export function editionDate(posts: Post[]): string | null {
  return latestDate(posts);
}

/** The newest real publish date across `posts` (ISO), or null when none is dated. */
export function latestDate(posts: Post[]): string | null {
  let latest: string | null = null;
  for (const p of posts) {
    const d = publishDate(p);
    if (d && (!latest || d > latest)) latest = d;
  }
  return latest;
}

/**
 * Posts in canonical reading order: newest first by publish date. Undated
 * posts follow every dated one, in the order they were given (sort is stable).
 */
export function orderedByDate(posts: Post[]): Post[] {
  return [...posts].sort((a, b) =>
    (publishDate(b) ?? "").localeCompare(publishDate(a) ?? ""),
  );
}

/**
 * The stories on either side of `post` in date order, for prev/next article
 * navigation. `next` is the newer story, `prev` the older one; either can be
 * null at the ends of the run.
 */
export function adjacentPosts(
  post: Post,
  all: Post[],
): { prev: Post | null; next: Post | null } {
  const ordered = orderedByDate(all);
  const i = ordered.findIndex((p) => p.id === post.id);
  if (i === -1) return { prev: null, next: null };
  return {
    next: i > 0 ? ordered[i - 1] : null,
    prev: i < ordered.length - 1 ? ordered[i + 1] : null,
  };
}

/** Section / kicker label for a post: its first tag, or a stable synthesized one. */
export function sectionFor(post: Post): string {
  return post.tags[0] || FALLBACK_SECTION;
}

/** URL slug for a section name, used by the `/sections/[slug]` route. */
export function sectionSlug(name: string): string {
  return slugify(name);
}

/** Href to a section's index page. */
export function sectionHref(name: string): string {
  return `/sections/${sectionSlug(name)}`;
}

/** All posts belonging to the section identified by `slug`, in input order. */
export function postsInSection(posts: Post[], slug: string): Post[] {
  return posts.filter((p) => sectionSlug(sectionFor(p)) === slug);
}

/**
 * The display name for a section slug: several tag spellings can share one slug,
 * so we show the most common spelling among the posts in that section (ties
 * broken alphabetically for determinism). Returns null when the slug is empty.
 */
export function sectionNameFor(posts: Post[], slug: string): string | null {
  const inSection = postsInSection(posts, slug);
  if (inSection.length === 0) return null;
  const counts = new Map<string, number>();
  for (const p of inSection) {
    const n = sectionFor(p);
    counts.set(n, (counts.get(n) ?? 0) + 1);
  }
  return [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  )[0][0];
}

/** Unique sections present across the set, most-populated first. */
export function allSections(posts: Post[]): string[] {
  return topSections(posts, Number.MAX_SAFE_INTEGER);
}

/**
 * The most common tags across a set of posts, for a masthead section nav.
 * Falls back to synthesized sections so the nav is never empty.
 */
export function topSections(posts: Post[], limit = 6): string[] {
  const counts = new Map<string, number>();
  for (const p of posts) {
    const s = sectionFor(p);
    counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([s]) => s);
}

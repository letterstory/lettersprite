/**
 * Editorial metadata derived from a post: reading time, a stable fallback
 * publish date, and a section label. Like bylines, anything synthesized here is
 * deterministic so it never changes between builds.
 */

import { slugify, stripHtml } from "./letterbrace/normalize";
import { hashString, pick } from "./rng";
import type { Post } from "./letterbrace/types";

/**
 * Fixed reference point for synthesized publish dates. Dateless posts are
 * spread backward from here, deterministically, so a fresh deployment with no
 * real timestamps still reads like an active publication with a back catalogue.
 * Bump this when refreshing the fleet.
 */
const DATE_ANCHOR = Date.UTC(2026, 6, 10); // 2026-07-10
const DAY = 86_400_000;

/** Words per minute used for the reading-time estimate. */
const WPM = 225;

/** Generic section pool used when a post has no tag of its own. */
const SECTIONS = [
  "Features", "Analysis", "Culture", "Business", "Technology", "Science",
  "Opinion", "Ideas", "Politics", "Style", "Report", "Interview",
];

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
 * The publish date to display: the real timestamp when present, otherwise a
 * stable synthesized ISO date. Never returns null, so every card and header can
 * show a dateline (a hallmark of a real outlet).
 */
export function publishDate(post: Post): string {
  if (post.createdAt) return post.createdAt;
  // Spread dateless posts across ~2–430 days before the anchor, weighted toward
  // recent by squaring a [0,1) value derived from the post.
  const r = (hashString(`${post.id}:date`) % 100000) / 100000;
  const daysAgo = 2 + Math.floor(r * r * 428);
  return new Date(DATE_ANCHOR - daysAgo * DAY).toISOString();
}

/**
 * The last-modified date to advertise: the real `updatedAt` when it is at or
 * after the publish date, otherwise the publish date. Guarantees
 * `dateModified >= datePublished` for structured data and OpenGraph.
 */
export function modifiedDate(post: Post): string {
  const published = publishDate(post);
  return post.updatedAt && post.updatedAt >= published
    ? post.updatedAt
    : published;
}

/**
 * Whether to show an "Updated" stamp. True only when Letterbrace supplied BOTH
 * a real `createdAt` and a later real `updatedAt` — so the stamp always reflects
 * a genuine revision against a genuine baseline, never a synthesized date.
 */
export function isUpdated(post: Post): boolean {
  return Boolean(
    post.createdAt && post.updatedAt && post.updatedAt > post.createdAt,
  );
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
 * Falls back to the date anchor when there are no posts.
 */
export function editionDate(posts: Post[]): string {
  const latest = posts
    .map((p) => publishDate(p))
    .sort((a, b) => b.localeCompare(a))[0];
  return latest ?? new Date(DATE_ANCHOR).toISOString();
}

/** Posts in canonical reading order: newest first by (synthesized) publish date. */
export function orderedByDate(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => publishDate(b).localeCompare(publishDate(a)));
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
  if (post.tags[0]) return post.tags[0];
  return pick(SECTIONS, `${post.id}:section`);
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

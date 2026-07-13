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

/** Estimated reading time in whole minutes (>= 1). */
export function readingTimeMinutes(post: Post): number {
  const words = stripHtml(post.content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WPM));
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

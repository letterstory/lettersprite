/**
 * Bylines.
 *
 * Every byline names someone real to the site. Letterstory assigns each post
 * an author from the site's author bank — a recurring set of authors generated
 * once per site and reused across its posts — and ships it as `author_profile`
 * (name, slug, bio, role, tenure). We render that record as-is: the bank slug
 * keys the `/authors/[slug]` page, so one author collects their whole body of
 * work. A legacy free-form `author` string is used verbatim as a staff writer.
 *
 * A post with no author at all gets ONE stable, site-level editorial byline
 * ("<Site> Editors") — never a made-up per-post person. Inventing a fresh
 * creator for every unbylined article is exactly the fabricated-profile pattern
 * search engines treat as deception.
 */

import { env } from "@/env";
import { pick } from "./rng";
import { orderedByDate } from "./editorial";
import { cleanAuthorName, slugify } from "./letterbrace/normalize";
import type { Post, PostAuthorProfile } from "./letterbrace/types";

/** Role for a real author whose record carries none. */
const DEFAULT_ROLE = "Staff Writer";

/** Role shown on the site-level editorial byline. */
const EDITORIAL_ROLE = "Editorial team";

/**
 * A small set of confident, legible avatar chip colors. Deliberately
 * theme-independent so white initials are always readable regardless of palette.
 */
const AVATAR_COLORS = [
  "#1f6feb", "#d1467c", "#2f9e6f", "#8957e5", "#c9720b",
  "#0e8a99", "#c0392b", "#3b5bdb", "#6d5227", "#7048a8",
  "#0f766e", "#b02a5b",
];

export interface Byline {
  /** Display name. */
  name: string;
  /** Editorial role/title. */
  role: string;
  /** 1–2 letter uppercase initials for the avatar. */
  initials: string;
  /** Hex background color for the avatar chip. */
  color: string;
  /** URL slug for the author's `/authors/[slug]` page. */
  slug: string;
  /**
   * True for a real author (a bank author or a Letterbrace-supplied name);
   * false only for the site-level editorial fallback byline.
   */
  provided: boolean;
  /** The bank record behind this byline, or null (free-form or editorial). */
  profile: PostAuthorProfile | null;
}

/** A contributor profile: the byline plus its bio furniture. */
export interface AuthorProfile {
  byline: Byline;
  /** Home city. Never invented; absent unless a real record supplies one. */
  location?: string;
  /** Year the contributor has written for the outlet "since", from the bank's
   *  `started_at`; absent when unknown. */
  since?: number;
  /** One- or two-sentence contributor bio. */
  bio: string;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * The post's real author, cleaned — or null when Letterbrace supplied nothing
 * usable (missing, or a placeholder like a stringified `"undefined"`). Cleaning
 * here too (not only in `normalize`) keeps every byline safe even for posts
 * constructed outside the normal ingest path.
 */
function providedAuthor(post: Post): string | null {
  return post.author ? cleanAuthorName(post.author) : null;
}

/** URL slug for an author name, used by the `/authors/[slug]` route. */
export function authorSlug(name: string): string {
  return slugify(name);
}

/** The site's editorial team name, e.g. "The Signal Editors". */
function editorialName(): string {
  return `${env.siteTitle} Editors`;
}

/**
 * The one site-level byline every unbylined post shares. Stable across posts
 * and builds, and honest: it credits the publication, not an invented person.
 */
export function editorialByline(): Byline {
  const name = editorialName();
  return {
    name,
    role: EDITORIAL_ROLE,
    initials: initialsOf(env.siteTitle),
    color: pick(AVATAR_COLORS, `${name}:color`),
    slug: authorSlug(name),
    provided: false,
    profile: null,
  };
}

/**
 * Resolve the byline for a post: the bank author from `author_profile`, else
 * the free-form `author` string, else the site-level editorial byline. Always
 * returns a complete `Byline`; never invents a person.
 */
export function bylineFor(post: Post): Byline {
  const profile = post.authorProfile ?? null;
  const name = profile?.name ?? providedAuthor(post);
  if (!name) return editorialByline();
  return {
    name,
    role: profile?.role?.trim() || DEFAULT_ROLE,
    initials: initialsOf(name),
    color: pick(AVATAR_COLORS, `${name}:color`),
    slug: profile?.slug || post.authorSlug || authorSlug(name),
    provided: true,
    profile,
  };
}

/** Join a short list into an "a, b and c" phrase. */
function humanList(items: string[]): string {
  const parts = items.filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? "";
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/** "The Signal" stays "The Signal"; "Signal" becomes "The Signal". */
function withArticle(title: string): string {
  return /^the\s/i.test(title) ? title : `The ${title}`;
}

/**
 * A contributor profile for an author's bio card and `/authors/[slug]` page.
 *
 * A bank author's bio is used verbatim and their tenure comes from the bank's
 * `started_at`. Anything the record doesn't say is left out rather than made
 * up: no home city, no invented tenure, no personal history. Without a bank
 * bio a real author gets a coverage-only line; the editorial byline describes
 * the team.
 *
 * `beats` are the sections the author writes in (lower-cased for prose).
 */
export function authorProfile(byline: Byline, beats: string[]): AuthorProfile {
  const beatPhrase =
    humanList([...new Set(beats.map((b) => b.toLowerCase()))].slice(0, 3)) ||
    "ideas and culture";
  const site = env.siteTitle;

  if (!byline.provided) {
    return {
      byline,
      bio: `${withArticle(site)} editorial team covers ${beatPhrase}.`,
    };
  }

  const started = byline.profile?.startedAt
    ? new Date(byline.profile.startedAt).getUTCFullYear()
    : NaN;
  return {
    byline,
    since: Number.isFinite(started) ? started : undefined,
    bio:
      byline.profile?.bio.trim() ||
      `${byline.name} covers ${beatPhrase} for ${site}.`,
  };
}

/**
 * Group posts by the author who bylines them, most-published first. Two posts
 * share an author when their byline slug matches — the bank slug for bank
 * authors, the slugified name otherwise — so a recurring author collects their
 * full body of work and every unbylined post lands on the one editorial page.
 */
export function authorsFromPosts(
  posts: Post[],
): { slug: string; byline: Byline; posts: Post[] }[] {
  const map = new Map<string, { byline: Byline; posts: Post[] }>();
  for (const post of posts) {
    const byline = bylineFor(post);
    const existing = map.get(byline.slug);
    if (existing) {
      existing.posts.push(post);
      // Prefer the bank record when only some of an author's posts carry it.
      if (!existing.byline.profile && byline.profile) existing.byline = byline;
    } else map.set(byline.slug, { byline, posts: [post] });
  }
  // Each author's posts are returned newest-first by (deterministic) publish
  // date, so every caller — the article bio card, the author page and the
  // sitemap — derives an identical, stable ordering (and identical bio beats).
  return [...map.entries()]
    .map(([slug, v]) => ({ slug, byline: v.byline, posts: orderedByDate(v.posts) }))
    .sort((a, b) => b.posts.length - a.posts.length || a.slug.localeCompare(b.slug));
}

/** Resolve one author (byline + their posts) by slug, or null. */
export function authorBySlug(
  posts: Post[],
  slug: string,
): { byline: Byline; posts: Post[] } | null {
  return authorsFromPosts(posts).find((a) => a.slug === slug) ?? null;
}

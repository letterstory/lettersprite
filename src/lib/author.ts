/**
 * Bylines.
 *
 * Every byline names someone real to the site. Letter assigns each post
 * an author from the site's author bank — a recurring set of authors generated
 * once per site and reused across its posts — and ships it as `author_profile`
 * (name, slug, bio, role, tenure). We render that record as-is and invent
 * nothing around it: a bank author with no bio or role is credited by name
 * alone (the default — Letter's generator writes names only unless asked
 * for more). The bank slug keys the `/authors/[slug]` page, so one author
 * collects their whole body of work. A legacy free-form `author` string is
 * used verbatim.
 *
 * A post with no author at all gets ONE stable, site-level editorial byline
 * ("<Site> Editors") — never a made-up per-post person. Inventing a fresh
 * creator for every unbylined article is exactly the fabricated-profile pattern
 * search engines treat as deception.
 *
 * A post whose disclosure lists `site_byline` gets that same site-level
 * byline, and no contributor profile: no bio card, no author page, no Person.
 */

import { env } from "@/env";
import { pick } from "./rng";
import { orderedByDate } from "./editorial";
import { siteByline } from "./disclosure";
import { cleanAuthorName, slugify } from "./letterbrace/normalize";
import type { Post, PostAuthorProfile } from "./letterbrace/types";

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
  /** Masthead role from the bank record, or null — never defaulted. */
  role: string | null;
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
  /**
   * Whether the byline has a contributor profile: a bio card under the
   * article, an `/authors/[slug]` page, a place in the contributor lists.
   * False under `site_byline`, which credits the site and stands for no one.
   */
  hasProfile: boolean;
}

/** A contributor profile: the byline plus its masthead furniture. */
export interface AuthorProfile {
  byline: Byline;
  /** Home city. Never invented; absent unless a real record supplies one. */
  location?: string;
  /** Year the contributor has written for the outlet "since", from the bank's
   *  `started_at`; absent when unknown. */
  since?: number;
  /** The bank's bio, verbatim; absent when the record has none (never invented). */
  bio?: string;
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
    role: null,
    initials: initialsOf(env.siteTitle),
    color: pick(AVATAR_COLORS, `${name}:color`),
    slug: authorSlug(name),
    provided: false,
    profile: null,
    hasProfile: true,
  };
}

/** The byline's `/authors/[slug]` page, or null when it has none. */
export function authorHref(byline: Byline): string | null {
  return byline.hasProfile ? `/authors/${byline.slug}` : null;
}

/**
 * Resolve the byline for a post: the bank author from `author_profile`, else
 * the free-form `author` string, else the site-level editorial byline. Always
 * returns a complete `Byline`; never invents a person.
 */
export function bylineFor(post: Post): Byline {
  if (siteByline(post.sponsorDisclosure)) {
    // Never the payload's author fields, whatever they carry: the site credits itself.
    return { ...editorialByline(), hasProfile: false };
  }
  const profile = post.authorProfile ?? null;
  const name = profile?.name ?? providedAuthor(post);
  if (!name) return editorialByline();
  return {
    name,
    role: profile?.role?.trim() || null,
    initials: initialsOf(name),
    color: pick(AVATAR_COLORS, `${name}:color`),
    slug: profile?.slug || post.authorSlug || authorSlug(name),
    provided: true,
    profile,
    hasProfile: true,
  };
}

/**
 * A contributor profile for an author's card and `/authors/[slug]` page. The
 * bio and tenure come from the bank record; anything it doesn't say is left out
 * rather than made up: no home city, no invented tenure, no synthesized bio.
 */
export function authorProfile(byline: Byline): AuthorProfile {
  const started = byline.profile?.startedAt
    ? new Date(byline.profile.startedAt).getUTCFullYear()
    : NaN;
  return {
    byline,
    since: Number.isFinite(started) ? started : undefined,
    bio: byline.profile?.bio.trim() || undefined,
  };
}

/**
 * Group posts by the author who bylines them, most-published first. Two posts
 * share an author when their byline slug matches — the bank slug for bank
 * authors, the slugified name otherwise — so a recurring author collects their
 * full body of work and every unbylined post lands on the one editorial page.
 * A post whose byline has no profile (`site_byline`) is in no author's list.
 */
export function authorsFromPosts(
  posts: Post[],
): { slug: string; byline: Byline; posts: Post[] }[] {
  const map = new Map<string, { byline: Byline; posts: Post[] }>();
  for (const post of posts) {
    const byline = bylineFor(post);
    if (!byline.hasProfile) continue;
    const existing = map.get(byline.slug);
    if (existing) {
      existing.posts.push(post);
      // Prefer the bank record when only some of an author's posts carry it.
      if (!existing.byline.profile && byline.profile) existing.byline = byline;
    } else map.set(byline.slug, { byline, posts: [post] });
  }
  // Each author's posts are returned newest-first by (deterministic) publish
  // date, so every caller — the article author card, the author page and the
  // sitemap — derives an identical, stable ordering.
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

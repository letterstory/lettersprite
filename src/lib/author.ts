/**
 * Bylines.
 *
 * A real publication has real reporters. When Letterbrace supplies an author we
 * use it; otherwise we synthesize a plausible, *persistent* staff writer from
 * the post itself. Because the name is derived by hashing stable post fields, a
 * given article always shows the same byline on every build — no database, no
 * drift — which is exactly what makes the site read as a legitimate outlet.
 */

import { env } from "@/env";
import { pick, pickInt } from "./rng";
import { orderedByDate } from "./editorial";
import { cleanAuthorName, slugify } from "./letterbrace/normalize";
import type { Post } from "./letterbrace/types";

/** Diverse first-name pool for synthesized bylines. */
const FIRST = [
  "Maya", "Diego", "Priya", "Elias", "Nadia", "Marcus", "Leila", "Julian",
  "Sofia", "Omar", "Clara", "Theo", "Amara", "Felix", "Ingrid", "Rafael",
  "Naomi", "Hassan", "Beatrice", "Kai", "Lucia", "Dmitri", "Yuki", "Cora",
  "Andre", "Simone", "Mateo", "Ruth", "Idris", "Vera", "Jonah", "Anaya",
  "Cyrus", "Estelle", "Malik", "Freya", "Rohan", "Camille", "Ezra", "Talia",
  "Nico", "Selin", "Dara", "Emeka", "Rosa", "Soren", "Lena", "Kwame",
];

/** Surname pool, intentionally varied in origin. */
const LAST = [
  "Chen", "Alvarez", "Nair", "Okafor", "Rahman", "Bennett", "Haddad", "Ford",
  "Rossi", "Nakamura", "Kowalski", "Mbeki", "Petrova", "Sørensen", "Reyes",
  "Whitfield", "Osei", "Larsen", "Delgado", "Kaur", "Voss", "Marchetti",
  "Abara", "Sinclair", "Novak", "Fontaine", "Adeyemi", "Bauer", "Costa",
  "Halvorsen", "Ibrahim", "Lindqvist", "Moreau", "Park", "Sabatini", "Vance",
  "Wexler", "Yamada", "Zola", "Ashworth", "Bergström", "Contreras", "Devi",
];

/** Editorial roles, in rough order of frequency. */
const ROLES = [
  "Staff Writer", "Staff Writer", "Staff Writer",
  "Senior Writer", "Senior Writer",
  "Contributing Editor", "Contributing Editor",
  "Correspondent", "Features Editor", "Reporter", "Columnist",
  "Editor at Large",
];

/**
 * A small set of confident, legible avatar chip colors. Deliberately
 * theme-independent so white initials are always readable regardless of palette.
 */
const AVATAR_COLORS = [
  "#1f6feb", "#d1467c", "#2f9e6f", "#8957e5", "#c9720b",
  "#0e8a99", "#c0392b", "#3b5bdb", "#6d5227", "#7048a8",
  "#0f766e", "#b02a5b",
];

/** Home cities for synthesized contributor bios. Deliberately global. */
const CITIES = [
  "New York", "London", "Berlin", "San Francisco", "Toronto", "Nairobi",
  "Singapore", "Melbourne", "Mexico City", "Lisbon", "Chicago", "Mumbai",
  "Cape Town", "Amsterdam", "Seoul", "Buenos Aires", "Austin", "Copenhagen",
  "Dublin", "Tokyo", "Barcelona", "Montréal", "Bangalore", "Stockholm",
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
  /** True when Letterbrace supplied the name (vs. a synthesized staff writer). */
  provided: boolean;
}

/** A contributor profile: the byline plus deterministic bio furniture. */
export interface AuthorProfile {
  byline: Byline;
  /** Home city (synthesized, stable per name). */
  location: string;
  /** Year the contributor has written for the outlet "since". */
  since: number;
  /** One- or two-sentence contributor bio, deterministic per name. */
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

/**
 * Resolve the byline for a post: the real author, or a synthesized staff writer
 * that stays constant across builds. Always returns a complete `Byline`.
 */
export function bylineFor(post: Post): Byline {
  const provided = providedAuthor(post);
  const seed = provided ?? `${post.id}:${post.slug}`;
  if (provided) {
    return {
      name: provided,
      role: pick(ROLES, `${seed}:role`),
      initials: initialsOf(provided),
      color: pick(AVATAR_COLORS, `${seed}:color`),
      slug: authorSlug(provided),
      provided: true,
    };
  }
  const first = pick(FIRST, `${seed}:first`);
  // A distinct seed suffix already decorrelates the surname stream from the
  // first name. (The previous `hashString(...) >> 3` used a *signed* shift on an
  // unsigned hash, which for large hashes produced a negative index and a
  // literal "undefined" surname — the "some authors say undefined" bug.)
  const last = pick(LAST, `${seed}:last`);
  const name = `${first} ${last}`;
  return {
    name,
    role: pick(ROLES, `${seed}:role`),
    initials: initialsOf(name),
    color: pick(AVATAR_COLORS, `${seed}:color`),
    slug: authorSlug(name),
    provided: false,
  };
}

/** Join a short list into an "a, b and c" phrase. */
function humanList(items: string[]): string {
  const parts = items.filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? "";
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/**
 * A deterministic contributor profile — home city, tenure and a short bio — for
 * an author's bio card and `/authors/[slug]` page. Seeded by name so it stays
 * consistent across every post a contributor bylines and across builds.
 *
 * `beats` are the sections the author writes in (lower-cased for prose). Bios
 * are coverage-focused; for real (provided) names we avoid inventing a personal
 * history and keep to what they cover.
 */
export function authorProfile(byline: Byline, beats: string[]): AuthorProfile {
  const seed = byline.name;
  const location = pick(CITIES, `${seed}:city`);
  const since = pickInt(2015, 2023, `${seed}:since`);
  const beatPhrase =
    humanList([...new Set(beats.map((b) => b.toLowerCase()))].slice(0, 3)) ||
    "ideas and culture";
  const first = byline.name.split(/\s+/)[0];
  const site = env.siteTitle;

  const bio = byline.provided
    ? `${byline.name} covers ${beatPhrase} for ${site}.`
    : `${byline.name} is a ${byline.role.toLowerCase()} at ${site} covering ${beatPhrase}. ` +
      `Based in ${location}, ${first} has written for ${site} since ${since}.`;

  return { byline, location, since, bio };
}

/**
 * Group posts by the author who bylines them, most-published first. Two posts
 * share an author only when their (cleaned) byline slug matches, so synthesized
 * one-off staff writers each get their own page and real repeat contributors
 * collect their full body of work.
 */
export function authorsFromPosts(
  posts: Post[],
): { slug: string; byline: Byline; posts: Post[] }[] {
  const map = new Map<string, { byline: Byline; posts: Post[] }>();
  for (const post of posts) {
    const byline = bylineFor(post);
    const existing = map.get(byline.slug);
    if (existing) existing.posts.push(post);
    else map.set(byline.slug, { byline, posts: [post] });
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

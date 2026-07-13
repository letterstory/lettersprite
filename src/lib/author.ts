/**
 * Bylines.
 *
 * A real publication has real reporters. When Letterbrace supplies an author we
 * use it; otherwise we synthesize a plausible, *persistent* staff writer from
 * the post itself. Because the name is derived by hashing stable post fields, a
 * given article always shows the same byline on every build — no database, no
 * drift — which is exactly what makes the site read as a legitimate outlet.
 */

import { hashString, pick } from "./rng";
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

export interface Byline {
  /** Display name. */
  name: string;
  /** Editorial role/title. */
  role: string;
  /** 1–2 letter uppercase initials for the avatar. */
  initials: string;
  /** Hex background color for the avatar chip. */
  color: string;
  /** True when Letterbrace supplied the name (vs. a synthesized staff writer). */
  provided: boolean;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Stable seed for a post's byline. */
function seedFor(post: Post): string {
  return post.author ?? `${post.id}:${post.slug}`;
}

/**
 * Resolve the byline for a post: the real author, or a synthesized staff writer
 * that stays constant across builds. Always returns a complete `Byline`.
 */
export function bylineFor(post: Post): Byline {
  const seed = seedFor(post);
  if (post.author) {
    return {
      name: post.author,
      role: pick(ROLES, `${seed}:role`),
      initials: initialsOf(post.author),
      color: pick(AVATAR_COLORS, `${seed}:color`),
      provided: true,
    };
  }
  const first = pick(FIRST, `${seed}:first`);
  // Offset the surname stream so first/last don't correlate.
  const last = LAST[(hashString(`${seed}:last`) >> 3) % LAST.length];
  const name = `${first} ${last}`;
  return {
    name,
    role: pick(ROLES, `${seed}:role`),
    initials: initialsOf(name),
    color: pick(AVATAR_COLORS, `${seed}:color`),
    provided: false,
  };
}

/**
 * Deterministic hashing + seeded selection.
 *
 * Everything the blog "generates" (author names, fallback publish dates, avatar
 * colors, which cover variant a post gets) must be STABLE: the same input has to
 * produce the same output on every request and every rebuild, on every machine.
 * A real database would persist these; instead we derive them purely from the
 * content, so they persist implicitly and for free — no storage, no drift.
 *
 * These helpers are pure and dependency-free (no `process.env`, no `Date`), so
 * they can be imported by both the app and the plain-Node cover generator.
 */

/** 32-bit FNV-1a. Stable across processes, platforms and Node versions. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    // 32-bit FNV prime; Math.imul keeps the multiply in 32-bit range.
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * A tiny seeded PRNG (mulberry32). Given a seed it yields a deterministic
 * sequence of floats in [0, 1). Use `rngFrom(seed)` to get an independent
 * stream keyed to a piece of content.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A deterministic float stream seeded by a string. */
export function rngFrom(seed: string): () => number {
  return mulberry32(hashString(seed));
}

/** Deterministically pick one item from a list, keyed by a seed string. */
export function pick<T>(items: readonly T[], seed: string): T {
  if (items.length === 0) throw new Error("pick() called with empty list");
  return items[hashString(seed) % items.length];
}

/** Deterministic integer in [min, max] (inclusive), keyed by a seed string. */
export function pickInt(min: number, max: number, seed: string): number {
  if (max <= min) return min;
  return min + (hashString(seed) % (max - min + 1));
}

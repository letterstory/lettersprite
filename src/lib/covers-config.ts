/**
 * Configuration shared between the runtime fallback-cover resolver
 * (`src/lib/covers.ts`) and the build-time generator
 * (`scripts/generate-covers.mts`).
 *
 * Kept dependency-free on purpose: the generator is a plain Node script and
 * imports this module directly, so it must not pull in `@/env` or anything
 * that reads `process.env`.
 */

/**
 * The ordered registry of cover *sets*. Each set is a distinct family of
 * full-bleed abstract patterns (geometric, gradient, organic…) generated for
 * every theme by `scripts/generate-covers.mts`.
 *
 * A blog uses exactly ONE set for all of its fallback covers, chosen
 * deterministically by hashing the blog title (see `fallbackCover`). ORDER IS
 * LOAD-BEARING: reordering or removing an entry remaps existing blogs to a
 * different set. Append new sets to the end.
 *
 * Every set name here must have a matching entry in the generator's `SETS` list,
 * and adding/removing one requires re-running `npm run generate:covers`.
 */
export const COVER_SETS = [
  "tessellation", // angular geometric mosaics (diamonds, hexagons, cubes…)
  "gradient-mesh", // soft luminous gradient color fields
  "waves", // layered flowing sine-wave bands
  "rings", // concentric ripples / topographic contours
  "halftone", // print-style dot fields shading a gradient
  "blobs", // organic overlapping fluid shapes
  "ridgeline", // layered mountain / paper-cut silhouettes
  "sunburst", // radial rays / starburst wedges
  "scatter", // scattered confetti geometry
] as const;

export type CoverSet = (typeof COVER_SETS)[number];

/**
 * How many variations are generated per set, per theme. One is chosen
 * deterministically per post (see `fallbackCover`) so posts within a blog vary.
 * Changing this requires re-running `npm run generate:covers`.
 */
export const VARIANTS_PER_SET = 6;

/** Folder under `/public` (and the matching URL prefix) for generated covers. */
export const FALLBACK_COVER_DIR = "covers";

/** Dimensions of every generated cover — 16:9, also a good OpenGraph ratio. */
export const FALLBACK_COVER_WIDTH = 1200;
export const FALLBACK_COVER_HEIGHT = 675;

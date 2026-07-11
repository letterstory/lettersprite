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
 * How many geometric-tessellation variations are generated per theme. One is
 * chosen deterministically per post (see `fallbackCover`). Changing this
 * requires re-running `npm run generate:covers`.
 */
export const FALLBACK_COVER_VARIANTS = 6;

/** Folder under `/public` (and the matching URL prefix) for generated covers. */
export const FALLBACK_COVER_DIR = "covers";

/** Dimensions of every generated cover — 16:9, also a good OpenGraph ratio. */
export const FALLBACK_COVER_WIDTH = 1200;
export const FALLBACK_COVER_HEIGHT = 675;

/**
 * One source in an article's Paper Trail — the vetted list of pages the article
 * actually drew on, compiled by Letterbrace at publish time and shipped in the
 * `/published` payload as `paper_trail.sources`. Rendered as a "Sources" section
 * and emitted as schema.org `citation` (see `seo.ts`).
 */
export interface PaperTrailSource {
  url: string;
  /** A human label — the page title, or the bare URL when none was captured. */
  title: string;
  /** One reader-facing sentence on what the source contributed (may be empty). */
  note: string;
}

/**
 * A normalized blog post. This is the stable shape the UI consumes, decoupled
 * from whatever the Letterbrace `/out` endpoint happens to return — see
 * `normalize.ts`, which tolerates missing and extra fields.
 */
export interface Post {
  /** Letterbrace article id, used to fetch the full body. */
  id: string;
  /** URL-safe, unique-within-the-list slug used for routing. */
  slug: string;
  title: string;
  /** Raw HTML from the API. NOT sanitized — sanitize before rendering. */
  content: string;
  /** Plain-text summary; derived (truncated) from `content` when the API omits
   *  one. Metadata only (meta description, OG/Twitter, JSON-LD, RSS) — never
   *  render it in the UI, use `dek` there. */
  excerpt: string;
  /** Display-safe subheadline for visible UI. Set only when the payload
   *  explicitly supplies a summary; null otherwise — never derived from the
   *  body, so it can't be a truncated fragment. */
  dek: string | null;
  /** Lower-cased status, e.g. "published" | "draft". */
  status: string;
  author: string | null;
  coverImage: string | null;
  /** Alt text for the cover, shipped by Letterbrace (`cover_image_alt`). */
  coverImageAlt: string | null;
  tags: string[];
  /** ISO 8601 timestamps, or null when the API doesn't supply them. */
  createdAt: string | null;
  updatedAt: string | null;
  /** The article's Paper Trail — vetted sources, or [] when there are none. */
  paperTrail: PaperTrailSource[];
}

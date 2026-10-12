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
 * Who to credit for a stock-photo cover, from the `/published` payload's flat
 * `cover_image_credit` field. Present only for covers sourced from a photo
 * library (Openverse / Pexels / Unsplash); generated and uploaded covers have
 * nobody to credit and carry null.
 *
 * `required` is the one field that matters legally: Unsplash's API terms and
 * every CC-BY licence oblige us to name the photographer wherever the photo is
 * shown, while Pexels and CC0 ask for nothing. Everything else is nullable —
 * a source that gave us no photographer still needs its licence named.
 */
export interface CoverCredit {
  /** Library the photo came from, lower-case: "unsplash" | "pexels" | "openverse". */
  source: string;
  photographer: string | null;
  photographerUrl: string | null;
  /** The photo's page on the source site, for the "on Unsplash" half of the credit. */
  sourceUrl: string | null;
  /** Licence identifier, e.g. "unsplash" | "pexels" | "cc-by" | "cc0". May be empty. */
  license: string;
  /** True when the licence obliges us to display this credit. */
  required: boolean;
}

/**
 * The structured author record Letterbrace ships as `author_profile` for a
 * byline drawn from the site's author bank — the recurring set of authors
 * generated once per site and reused across its posts. Absent (null) for
 * legacy free-form bylines and for older Letterbrace payloads.
 */
export interface PostAuthorProfile {
  name: string;
  /** Stable bank slug; keys the `/authors/[slug]` route. */
  slug: string;
  /** Contributor bio, verbatim from the bank. May be empty. */
  bio: string;
  /** Editorial role/title, or null when the bank assigned none. */
  role: string | null;
  expertise: string[];
  /** ISO date the author started writing for the site, or null. */
  startedAt: string | null;
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
  /** Bank slug for the byline (`author_slug`), or null for free-form/absent. */
  authorSlug: string | null;
  /** Structured bank author (`author_profile`), or null. */
  authorProfile: PostAuthorProfile | null;
  coverImage: string | null;
  /** Alt text for the cover, shipped by Letterbrace (`cover_image_alt`). */
  coverImageAlt: string | null;
  /** Photographer + licence for a stock-photo cover; null for every other kind. */
  coverCredit: CoverCredit | null;
  tags: string[];
  /** ISO 8601 timestamps, or null when the API doesn't supply them. */
  createdAt: string | null;
  updatedAt: string | null;
  /** The article's Paper Trail — vetted sources, or [] when there are none. */
  paperTrail: PaperTrailSource[];
}

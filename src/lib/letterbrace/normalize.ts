import { tightenPunctuationSpacing } from "@/lib/text";
import type { PaperTrailSource, Post } from "./types";

type Raw = Record<string, unknown>;

function asString(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return null;
}

/** First non-empty string value among the candidate keys. */
function pick(raw: Raw, keys: string[]): string | null {
  for (const k of keys) {
    const s = asString(raw[k]);
    if (s && s.trim()) return s;
  }
  return null;
}

/** URL-safe slug from arbitrary text. Never empty. */
export function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return s || "post";
}

/** Strip tags and decode the handful of entities we care about, to plain text. */
export function stripHtml(html: string): string {
  const clean = html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&(?:#39|apos);/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
  return tightenPunctuationSpacing(clean);
}

/** Trailing whitespace, punctuation and symbols we never want jammed against
 *  the ellipsis (".…", " ,…", "50%…"). Unicode-aware so it covers quotes,
 *  brackets, dashes, currency, etc. as well as the ASCII basics. */
const TRAILING_NOISE = /[\s\p{P}\p{S}]+$/u;

/**
 * A trimmed, word-boundary plain-text excerpt. When truncated it ends with a
 * space then an ellipsis (" …") and never leaves a trailing punctuation mark
 * against the ellipsis — both of which read as broken ("the…", "registry.…").
 */
export function excerptFrom(html: string, max = 180): string {
  const clean = stripHtml(html);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const body = (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(TRAILING_NOISE, "");
  // If the cut was all punctuation/whitespace, fall back to the raw trimmed cut.
  return `${body || cut.trimEnd()} …`;
}

function toIso(...candidates: unknown[]): string | null {
  for (const c of candidates) {
    const s = asString(c);
    if (!s) continue;
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return null;
}

function toTags(raw: Raw): string[] {
  const value = raw.tags ?? raw.categories ?? raw.labels;
  if (!Array.isArray(value)) return [];
  return value
    .map((t) => (typeof t === "string" ? t : asString((t as Raw)?.name)))
    .filter((t): t is string => Boolean(t && t.trim()));
}

/**
 * Tokens that upstream systems emit in place of a real name — a stringified
 * `undefined`/`null`, a placeholder dash, etc. Matched whole-word so legitimate
 * names are never touched.
 */
const NULLISH_NAME = /^(?:undefined|null|nan|n\/?a|none|nil|unknown|-|–|—|\.)$/i;

/**
 * Clean an author string coming from the API. Upstream name concatenation can
 * leave literal `"undefined"`/`"null"` fragments (e.g. `"Jane undefined"`,
 * `"undefined undefined"`, a bare `"null"`), which must never render as a
 * byline. Strips a leading "By ", drops nullish word fragments, and returns
 * `null` when nothing usable remains — so the caller degrades to the
 * deterministic synthesized staff writer instead.
 */
export function cleanAuthorName(raw: string): string | null {
  const withoutPrefix = raw.replace(/^\s*by[:\s]+/i, "").trim();
  if (!withoutPrefix) return null;
  const kept = withoutPrefix
    .split(/\s+/)
    .filter((w) => !NULLISH_NAME.test(w.replace(/[.,;]+$/, "")))
    .join(" ")
    .trim();
  if (!kept || NULLISH_NAME.test(kept)) return null;
  return kept;
}

/**
 * The article's Paper Trail from the `/published` payload
 * (`paper_trail.sources`: `[{ url, title, note }]`). Tolerant of an absent or
 * malformed field — always returns a (possibly empty) array — and drops
 * url-less entries. Title falls back to the url when none was captured.
 */
function toPaperTrail(raw: Raw): PaperTrailSource[] {
  const trail = raw.paper_trail;
  if (!trail || typeof trail !== "object") return [];
  const sources = (trail as Raw).sources;
  if (!Array.isArray(sources)) return [];
  return sources
    .map((s): PaperTrailSource | null => {
      const o = (s ?? {}) as Raw;
      const url = asString(o.url)?.trim();
      if (!url) return null;
      return {
        url,
        title: asString(o.title)?.trim() || url,
        note: asString(o.note)?.trim() || "",
      };
    })
    .filter((s): s is PaperTrailSource => s !== null);
}

/** A usable image URL from a string, or from an object carrying a `url`. */
function coverUrlFrom(value: unknown): string | null {
  const s = asString(value);
  if (s && s.trim()) return s.trim();
  if (value && typeof value === "object") {
    const url = asString((value as Raw).url);
    if (url && url.trim()) return url.trim();
  }
  return null;
}

/**
 * The post's cover image URL. Checked in order: flat top-level fields (string
 * or `{ url }` object), then Letterbrace's `metadata.cover_image` (the object
 * written by the cover generate/upload flows) and its legacy
 * `metadata.cover_image_url` string.
 */
function toCoverImage(raw: Raw): string | null {
  const keys = [
    "cover_image",
    "coverImage",
    "featured_image",
    "featuredImage",
    "image",
    "cover",
    "thumbnail",
  ];
  for (const key of keys) {
    const hit = coverUrlFrom(raw[key]);
    if (hit) return hit;
  }
  const meta = raw.metadata;
  if (meta && typeof meta === "object") {
    const m = meta as Raw;
    return (
      coverUrlFrom(m.cover_image) ??
      coverUrlFrom(m.cover_image_url) ??
      coverUrlFrom(m.coverImage)
    );
  }
  return null;
}

function toAuthor(raw: Raw): string | null {
  const direct = pick(raw, ["author", "author_name", "authorName", "byline"]);
  if (direct) return cleanAuthorName(direct);
  const a = raw.author;
  if (a && typeof a === "object") {
    const o = a as Raw;
    const name =
      asString(o.name) ??
      [asString(o.first_name ?? o.firstName), asString(o.last_name ?? o.lastName)]
        .filter(Boolean)
        .join(" ");
    return name ? cleanAuthorName(name) : null;
  }
  return null;
}

/**
 * Normalize one raw article object into a Post. Returns null only when there's
 * no usable id. Every other field degrades gracefully so unexpected payload
 * shapes don't break rendering.
 */
export function normalizePost(raw: Raw): Post | null {
  const id = pick(raw, ["id", "article_id", "articleId", "uuid", "_id"]);
  if (!id) return null;

  const content =
    pick(raw, ["content", "body", "html", "body_html", "content_html"]) ?? "";
  // Letterbrace's /out payload exposes the headline as `summary` (there is no
  // `title` field). Prefer an explicit title if one ever appears, otherwise use
  // the summary as the title — and only treat the summary as an excerpt when it
  // isn't already serving as the title, to avoid showing the same text twice.
  const explicitTitle = pick(raw, ["title", "name", "headline", "subject"]);
  const summary = pick(raw, [
    "summary",
    "excerpt",
    "description",
    "subtitle",
    "dek",
  ]);
  const title = explicitTitle ?? summary ?? "Untitled";
  const suppliedExcerpt = explicitTitle ? summary : null;
  const suppliedSlug = pick(raw, ["slug", "permalink", "path"]);

  return {
    id,
    slug: slugify(suppliedSlug ?? title),
    title,
    content,
    excerpt: suppliedExcerpt ? stripHtml(suppliedExcerpt) : excerptFrom(content),
    status: (pick(raw, ["status", "state"]) ?? "published").toLowerCase(),
    author: toAuthor(raw),
    coverImage: toCoverImage(raw),
    tags: toTags(raw),
    createdAt: toIso(
      raw.published_at,
      raw.publishedAt,
      raw.created_at,
      raw.createdAt,
      raw.date,
    ),
    updatedAt: toIso(raw.updated_at, raw.updatedAt, raw.modified_at),
    paperTrail: toPaperTrail(raw),
  };
}

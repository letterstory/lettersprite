import { env, hasLetterbraceKey } from "@/env";
import { normalizePost } from "./normalize";
import { loadPayloadPosts, loadWhyChoosePost } from "./payload";
import { samplePosts } from "./sample";
import type { Post } from "./types";

/**
 * Read-only client for the Letterbrace Integrations API.
 *
 * The blog reads from `GET /published`, which returns the frozen published
 * article (real `title` + `content`, plus `slug`, `published_at`,
 * `collection_id`). Note: `/out` is intentionally NOT used — it only returns
 * `article_id` + `summary`, never the published body.
 */

async function apiGet(path: string): Promise<unknown> {
  const res = await fetch(`${env.letterbraceApiUrl}${path}`, {
    headers: {
      "x-integrations-key": env.letterbraceApiKey,
      accept: "application/json",
    },
    // Baked in at build time and never re-fetched at runtime (the routes are
    // `dynamic = "force-static"`). Updating content requires a rebuild.
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error(
      `Letterbrace API responded ${res.status} ${res.statusText} for ${path}`,
    );
  }
  return res.json();
}

/** Find the array of articles inside whatever envelope the API returns. */
function extractArray(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (payload && typeof payload === "object") {
    for (const key of ["items", "articles", "data", "results", "posts"]) {
      const v = (payload as Record<string, unknown>)[key];
      if (Array.isArray(v)) return v as Record<string, unknown>[];
    }
  }
  return [];
}

/** Find a single article object inside whatever envelope the API returns. */
function extractOne(payload: unknown): Record<string, unknown> | null {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const obj = payload as Record<string, unknown>;
    if ("title" in obj || "content" in obj || "article_id" in obj) return obj;
    for (const key of ["item", "article", "data", "post", "result"]) {
      const v = obj[key];
      if (v && typeof v === "object" && !Array.isArray(v)) {
        return v as Record<string, unknown>;
      }
    }
    return obj;
  }
  return extractArray(payload)[0] ?? null;
}

/** Drop any repeated ids, keeping the first occurrence (stable React keys). */
function dedupeById(posts: Post[]): Post[] {
  const seen = new Set<string>();
  return posts.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

/** Make slugs unique within a list by suffixing collisions with the id. */
function ensureUniqueSlugs(posts: Post[]): Post[] {
  const seen = new Set<string>();
  return posts.map((p) => {
    let { slug } = p;
    if (seen.has(slug)) slug = `${slug}-${p.id.slice(0, 6)}`;
    seen.add(slug);
    return slug === p.slug ? p : { ...p, slug };
  });
}

function isVisible(p: Post): boolean {
  return env.showDrafts || p.status !== "draft";
}

/** Build a `/published` path, optionally scoped to a single collection. */
function publishedPath(params: Record<string, string> = {}): string {
  const search = new URLSearchParams(params);
  if (env.collectionId) search.set("collection_id", env.collectionId);
  const qs = search.toString();
  return `/published${qs ? `?${qs}` : ""}`;
}

/**
 * All visible published posts, newest first, capped at POSTS_LIMIT.
 *
 * Sources (merged in order, deduped by id):
 *  1. Letterbrace API — when LETTERBRACE_API_KEY is set
 *  2. content/payload.json — when PAYLOAD_ENABLED=true
 *
 * Either source can be used alone or together. When neither is configured,
 * sample posts render so the theme is always previewable.
 */
export async function getPosts(): Promise<Post[]> {
  const payloadPosts = loadPayloadPosts().filter(isVisible);
  const hasPayload = payloadPosts.length > 0;

  if (!hasLetterbraceKey && !hasPayload) return samplePosts;

  let letterbraecPosts: Post[] = [];
  if (hasLetterbraceKey) {
    try {
      const raw = await apiGet(publishedPath());
      letterbraecPosts = extractArray(raw)
        .map(normalizePost)
        .filter((p): p is Post => p !== null)
        .filter(isVisible);
    } catch (err) {
      console.error("[letterbrace] failed to list published posts:", err);
    }
  }

  const merged = dedupeById([...letterbraecPosts, ...payloadPosts])
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, env.postsLimit);

  return ensureUniqueSlugs(merged);
}

/**
 * The "Why companies choose X" page, or null when none is configured. Sourced
 * from the payload's `whyChoose` field (see loadWhyChoosePost) — the same
 * content path as regular posts, never the Letterbrace API. Kept out of
 * getPosts() so it stays off the feed and only powers the `/why` route.
 */
export function getWhyChoosePost(): Post | null {
  return loadWhyChoosePost();
}

/**
 * A single published post by slug. The list already carries full content, so
 * this resolves from the cached list; it falls back to a direct `?slug=` fetch
 * for posts beyond the list cap.
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPosts();
  const match = posts.find((p) => p.slug === slug || p.id === slug);
  if (match) return match;
  if (!hasLetterbraceKey) return null;
  try {
    const payload = await apiGet(publishedPath({ slug }));
    const raw = extractOne(payload);
    const post = raw ? normalizePost(raw) : null;
    return post && isVisible(post) ? post : null;
  } catch (err) {
    console.error(`[letterbrace] failed to fetch published post "${slug}":`, err);
    return null;
  }
}

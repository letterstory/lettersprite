import { env, hasLetterbraceKey } from "@/env";
import { normalizePost } from "./normalize";
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
 * All visible published posts, newest first, capped at POSTS_LIMIT. Returns
 * sample posts when no key is configured, and [] (rather than throwing) on API
 * errors, so the site renders an empty state instead of a 500.
 */
export async function getPosts(): Promise<Post[]> {
  if (!hasLetterbraceKey) return samplePosts;
  try {
    const payload = await apiGet(publishedPath());
    const posts = dedupeById(
      extractArray(payload)
        .map(normalizePost)
        .filter((p): p is Post => p !== null)
        .filter(isVisible),
    )
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .slice(0, env.postsLimit);
    return ensureUniqueSlugs(posts);
  } catch (err) {
    console.error("[letterbrace] failed to list published posts:", err);
    return [];
  }
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

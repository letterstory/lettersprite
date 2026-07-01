import { env, hasLetterbraceKey } from "@/env";
import { normalizePost } from "./normalize";
import { samplePosts } from "./sample";
import type { Post } from "./types";

/**
 * Thin client for the Letterbrace Integrations API. The blog only reads, via
 * `GET /out` (list) and `GET /out?article_id=` (single). Auth is the
 * `x-integrations-key` header. Responses are cached with ISR revalidation.
 */

async function apiGet(path: string): Promise<unknown> {
  const res = await fetch(`${env.letterbraceApiUrl}${path}`, {
    headers: {
      "x-integrations-key": env.letterbraceApiKey,
      accept: "application/json",
    },
    // Baked in at build time and never re-fetched at runtime. Combined with
    // `dynamic = "force-static"` on the routes, the whole site is static HTML;
    // updating content requires a rebuild.
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
    for (const key of ["articles", "data", "items", "results", "posts"]) {
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
    for (const key of ["article", "data", "post", "result"]) {
      const v = obj[key];
      if (v && typeof v === "object" && !Array.isArray(v)) {
        return v as Record<string, unknown>;
      }
    }
    return obj;
  }
  return extractArray(payload)[0] ?? null;
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

/**
 * All visible posts, newest first. Returns [] (rather than throwing) when no
 * key is configured or the API errors, so the site renders an empty state
 * instead of a 500. Errors are logged for debugging.
 */
export async function getPosts(): Promise<Post[]> {
  // No collection connected yet — serve sample posts so the site looks alive.
  if (!hasLetterbraceKey) return samplePosts;
  try {
    const payload = await apiGet(`/out?limit=${env.postsLimit}`);
    const posts = extractArray(payload)
      .map(normalizePost)
      .filter((p): p is Post => p !== null)
      .filter(isVisible)
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    return ensureUniqueSlugs(posts);
  } catch (err) {
    console.error("[letterbrace] failed to list posts:", err);
    return [];
  }
}

/** The full post for an article id, or null. */
export async function getPostById(id: string): Promise<Post | null> {
  if (!hasLetterbraceKey) return null;
  try {
    const payload = await apiGet(`/out?article_id=${encodeURIComponent(id)}`);
    const raw = extractOne(payload);
    return raw ? normalizePost(raw) : null;
  } catch (err) {
    console.error(`[letterbrace] failed to fetch post ${id}:`, err);
    return null;
  }
}

/**
 * Resolve a post by slug (or raw id) via the cached list — keeping slugs
 * consistent with what's linked — then load the full body from the single
 * endpoint. Falls back to the list summary if the detail call fails.
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPosts();
  const match = posts.find((p) => p.slug === slug || p.id === slug);
  if (!match) return null;
  const full = await getPostById(match.id);
  return full ? { ...full, slug: match.slug } : match;
}

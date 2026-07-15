import path from "node:path";
import { readFileSync } from "node:fs";
import { env } from "@/env";
import { normalizePost } from "./normalize";
import type { Post } from "./types";

/**
 * Read and parse the payload file (content/payload.json, or PAYLOAD_FILE).
 * Returns null when payload ingestion is off or the file can't be read/parsed.
 * The file is read synchronously at build time.
 */
function readPayload(): unknown {
  if (!env.payloadEnabled) return null;

  const filePath = path.resolve(process.cwd(), env.payloadFile);
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    console.warn(`[payload] could not read ${filePath} — skipping`);
    return null;
  }
}

/**
 * Load posts from content/payload.json (or the path in PAYLOAD_FILE).
 * This is the zero-integration content path: letterstory writes posts to this
 * file and triggers a Vercel rebuild — no Letterbrace setup required.
 *
 * The schema is whatever normalizePost() already understands: { posts: [...] }
 * where each item can have id, title, content (HTML), slug, author, tags,
 * cover_image, published_at, etc. Missing fields degrade gracefully.
 */
export function loadPayloadPosts(): Post[] {
  const raw = readPayload();
  if (raw === null) return [];

  const items: unknown[] =
    Array.isArray(raw)
      ? raw
      : Array.isArray((raw as Record<string, unknown>)?.posts)
        ? ((raw as Record<string, unknown>).posts as unknown[])
        : [];

  return items
    .map((item) =>
      typeof item === "object" && item !== null
        ? normalizePost(item as Record<string, unknown>)
        : null,
    )
    .filter((p): p is Post => p !== null);
}

/**
 * Load the optional "Why companies choose X" page from the payload's
 * `whyChoose` field. It's authored and delivered exactly like a regular
 * post — a single object normalized through the same normalizePost() — so it
 * inherits the same title/body/byline/dateline/section handling. It lives in
 * its own top-level field (not the `posts` array) so it never surfaces in the
 * feed, sections or RSS; it only powers the dedicated `/why` route.
 *
 * Returns null when payload ingestion is off, the field is absent, or the
 * object has no usable content — the route then 404s.
 */
export function loadWhyChoosePost(): Post | null {
  const raw = readPayload();
  if (raw === null || typeof raw !== "object") return null;

  const field =
    (raw as Record<string, unknown>).whyChoose ??
    (raw as Record<string, unknown>).why_choose;
  if (!field || typeof field !== "object" || Array.isArray(field)) return null;

  return normalizePost(field as Record<string, unknown>);
}

/**
 * Generates `src/generated/redirect-manifest.json` — the set of valid post and
 * section slugs this build serves — so `src/middleware.ts` can 308-redirect any
 * OTHER /posts/* or /sections/* URL (an old page removed by a re-strategize,
 * still indexed by Google) to the homepage WITHOUT any request-time API call.
 *
 * Runs before `next build` (see package.json). It replicates the exact slug
 * pipeline of `getPosts()` (src/lib/letterbrace/client.ts) + the section logic
 * (src/lib/editorial.ts) against the same Letterbrace API, so the manifest lists
 * precisely the slugs the site prerenders. The app modules can't be imported
 * here (they use the `@/` path alias Node won't resolve), so the small pure
 * functions are copied verbatim below — keep them in sync if the originals change.
 *
 * FAIL-SAFE: on ANY problem (no key, fetch error, non-2xx, empty result) it
 * writes `{ ok: false, ... }` and exits 0. Middleware treats ok:false — and any
 * empty slug list — as "do nothing", so a bad manifest can only ever fall back
 * to today's plain 404; it can never redirect a valid post.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = path.join(ROOT, "src", "generated", "redirect-manifest.json");

// --- env (mirrors src/env.ts) ---------------------------------------------
const API_URL = (process.env.LETTERBRACE_API_URL ?? "https://app.letterbrace.com/api/integrations").replace(/\/$/, "");
const API_KEY = process.env.LETTERBRACE_API_KEY ?? "";
const COLLECTION_ID = process.env.LETTERBRACE_COLLECTION_ID ?? "";
const POSTS_LIMIT = Math.min(Math.max(Number(process.env.POSTS_LIMIT ?? 50) || 50, 1), 100);
const SHOW_DRAFTS = /^(1|true|yes|on)$/i.test(process.env.SHOW_DRAFTS ?? "");

// --- copied verbatim from the app (keep in sync) --------------------------
type Raw = Record<string, unknown>;

function asString(v: unknown): string | null {
	if (typeof v === "string") return v;
	if (typeof v === "number" || typeof v === "boolean") return String(v);
	return null;
}
function pick(raw: Raw, keys: string[]): string | null {
	for (const k of keys) {
		const s = asString(raw[k]);
		if (s && s.trim()) return s;
	}
	return null;
}
function slugify(input: string): string {
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
function toTags(raw: Raw): string[] {
	const value = (raw.tags ?? raw.categories ?? raw.labels) as unknown;
	if (!Array.isArray(value)) return [];
	return value
		.map((t) => (typeof t === "string" ? t : asString((t as Raw)?.name)))
		.filter((t): t is string => Boolean(t && t.trim()));
}
function toIso(raw: Raw): string {
	for (const k of ["published_at", "publishedAt", "created_at", "createdAt", "date"]) {
		const v = raw[k];
		if (typeof v === "string" && v) {
			const d = new Date(v);
			if (!Number.isNaN(d.getTime())) return d.toISOString();
		}
	}
	return "";
}
const FALLBACK_SECTION = "Features";

interface Lite {
	id: string;
	slug: string;
	status: string;
	tags: string[];
	createdAt: string;
}

function normalize(raw: Raw): Lite | null {
	const id = pick(raw, ["id", "article_id", "articleId", "uuid", "_id"]);
	if (!id) return null;
	const title = pick(raw, ["title", "name", "headline", "subject"]) ?? pick(raw, ["summary", "excerpt", "description", "subtitle", "dek"]) ?? "Untitled";
	const suppliedSlug = pick(raw, ["slug", "permalink", "path"]);
	return {
		id,
		slug: slugify(suppliedSlug ?? title),
		status: (pick(raw, ["status", "state"]) ?? "published").toLowerCase(),
		tags: toTags(raw),
		createdAt: toIso(raw),
	};
}
function extractArray(payload: unknown): Raw[] {
	if (Array.isArray(payload)) return payload as Raw[];
	if (payload && typeof payload === "object") {
		for (const key of ["items", "articles", "data", "results", "posts"]) {
			const v = (payload as Raw)[key];
			if (Array.isArray(v)) return v as Raw[];
		}
	}
	return [];
}
function dedupeById(posts: Lite[]): Lite[] {
	const seen = new Set<string>();
	return posts.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
}
function ensureUniqueSlugs(posts: Lite[]): Lite[] {
	const seen = new Set<string>();
	return posts.map((p) => {
		let slug = p.slug;
		if (seen.has(slug)) slug = `${slug}-${p.id.slice(0, 6)}`;
		seen.add(slug);
		return slug === p.slug ? p : { ...p, slug };
	});
}
const isVisible = (p: Lite) => SHOW_DRAFTS || p.status !== "draft";

// --------------------------------------------------------------------------
async function main() {
	const failSafe = { ok: false as const, postSlugs: [], sectionSlugs: [] };
	await mkdir(path.dirname(OUT_FILE), { recursive: true });

	if (!API_KEY) {
		console.warn("[redirect-manifest] no LETTERBRACE_API_KEY — writing inert manifest");
		await writeFile(OUT_FILE, JSON.stringify(failSafe, null, 2));
		return;
	}

	const search = new URLSearchParams();
	if (COLLECTION_ID) search.set("collection_id", COLLECTION_ID);
	const url = `${API_URL}/published${search.toString() ? `?${search}` : ""}`;

	let posts: Lite[];
	try {
		const res = await fetch(url, {
			headers: { "x-integrations-key": API_KEY, accept: "application/json" },
			signal: AbortSignal.timeout(20_000),
		});
		if (!res.ok) throw new Error(`API responded ${res.status} ${res.statusText}`);
		const payload = await res.json();
		posts = ensureUniqueSlugs(
			dedupeById(
				extractArray(payload)
					.map(normalize)
					.filter((p): p is Lite => p !== null)
					.filter(isVisible)
			)
				.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
				.slice(0, POSTS_LIMIT)
		);
	} catch (err) {
		console.warn(`[redirect-manifest] fetch failed — writing inert manifest: ${err instanceof Error ? err.message : String(err)}`);
		await writeFile(OUT_FILE, JSON.stringify(failSafe, null, 2));
		return;
	}

	if (posts.length === 0) {
		console.warn("[redirect-manifest] zero posts — writing inert manifest");
		await writeFile(OUT_FILE, JSON.stringify(failSafe, null, 2));
		return;
	}

	const postSlugs = [...new Set(posts.map((p) => p.slug))];
	const sectionSlugs = [...new Set(posts.map((p) => slugify(p.tags[0] || FALLBACK_SECTION)))];

	const manifest = { ok: true as const, postSlugs, sectionSlugs, generatedAt: new Date().toISOString() };
	await writeFile(OUT_FILE, JSON.stringify(manifest, null, 2));
	console.log(`[redirect-manifest] wrote ${postSlugs.length} post + ${sectionSlugs.length} section slugs`);
}

main().catch(async (err) => {
	// Never fail the build over the manifest.
	console.warn(`[redirect-manifest] unexpected error — writing inert manifest: ${err instanceof Error ? err.message : String(err)}`);
	try {
		await mkdir(path.dirname(OUT_FILE), { recursive: true });
		await writeFile(OUT_FILE, JSON.stringify({ ok: false, postSlugs: [], sectionSlugs: [] }, null, 2));
	} catch {
		/* give up silently */
	}
});

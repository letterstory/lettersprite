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
 * here (they use the `@/` path alias), so the small pure functions are copied
 * verbatim below — keep them in sync if the originals change.
 *
 * Plain `.mjs` (no TypeScript) so it runs on any Node the build image ships,
 * without relying on on-the-fly type stripping.
 *
 * FAIL-SAFE: on ANY problem (no key, fetch error, non-2xx, empty result) it
 * writes `{ ok: false, ... }` and exits 0. Middleware treats ok:false — and any
 * empty slug list — as "do nothing", so a bad manifest can only ever fall back
 * to today's plain 404; it can never redirect a valid post.
 */
import { existsSync, statSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = path.join(ROOT, "src", "generated", "redirect-manifest.json");

// --- env (mirrors src/env.ts) ---------------------------------------------
const API_URL = (process.env.LETTERBRACE_API_URL ?? "https://app.letterbrace.com/api/integrations").replace(/\/$/, "");
const API_KEY = process.env.LETTERBRACE_API_KEY ?? "";
const COLLECTION_ID = process.env.LETTERBRACE_COLLECTION_ID ?? "";
// The archive ceiling, as src/env.ts reads it (default 500, at most 1000). This once
// stayed at 50 / 100 after the app's went up: every post past the 100th was built,
// listed in the sitemap, then 308-redirected to the home page by the proxy.
const POSTS_LIMIT = Math.min(Math.max(Number(process.env.POSTS_LIMIT || 500) || 500, 1), 1000);
const CONTENT_DIR = path.join(ROOT, process.env.LETTER_CONTENT_DIR || "content/posts");
const SHOW_DRAFTS = /^(1|true|yes|on)$/i.test(process.env.SHOW_DRAFTS ?? "");

// --- copied verbatim from the app (keep in sync) --------------------------
function asString(v) {
	if (typeof v === "string") return v;
	if (typeof v === "number" || typeof v === "boolean") return String(v);
	return null;
}
function pick(raw, keys) {
	for (const k of keys) {
		const s = asString(raw[k]);
		if (s && s.trim()) return s;
	}
	return null;
}
function slugify(input) {
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
function toTags(raw) {
	const value = raw.tags ?? raw.categories ?? raw.labels;
	if (!Array.isArray(value)) return [];
	return value
		.map((t) => (typeof t === "string" ? t : asString(t?.name)))
		.filter((t) => Boolean(t && t.trim()));
}
function toIso(raw) {
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

function normalize(raw) {
	const id = pick(raw, ["id", "article_id", "articleId", "uuid", "_id"]);
	if (!id) return null;
	const title =
		pick(raw, ["title", "name", "headline", "subject"]) ??
		pick(raw, ["summary", "excerpt", "description", "subtitle", "dek"]) ??
		"Untitled";
	const suppliedSlug = pick(raw, ["slug", "permalink", "path"]);
	return {
		id,
		slug: slugify(suppliedSlug ?? title),
		status: (pick(raw, ["status", "state"]) ?? "published").toLowerCase(),
		tags: toTags(raw),
		createdAt: toIso(raw),
	};
}
function extractArray(payload) {
	if (Array.isArray(payload)) return payload;
	if (payload && typeof payload === "object") {
		for (const key of ["items", "articles", "data", "results", "posts"]) {
			const v = payload[key];
			if (Array.isArray(v)) return v;
		}
	}
	return [];
}
function dedupeById(posts) {
	const seen = new Set();
	return posts.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
}
function ensureUniqueSlugs(posts) {
	const seen = new Set();
	return posts.map((p) => {
		let slug = p.slug;
		if (seen.has(slug)) slug = `${slug}-${p.id.slice(0, 6)}`;
		seen.add(slug);
		return slug === p.slug ? p : { ...p, slug };
	});
}
const isVisible = (p) => SHOW_DRAFTS || p.status !== "draft";

// --- post files (mirrors src/lib/letterbrace/files.ts) --------------------
const FRONTMATTER = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
function rawFromPostFile(text, fileName) {
	const match = FRONTMATTER.exec(text.replace(/^\uFEFF/, ""));
	const parsed = match ? parseYaml(match[1]) : null;
	const data = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
	const stem = path.basename(fileName).replace(/\.(md|markdown)$/i, "");
	return { ...data, slug: data.slug ?? stem, article_id: data.article_id ?? data.id ?? `file:${stem}` };
}
const hasPostFiles = () => {
	try {
		return existsSync(CONTENT_DIR) && statSync(CONTENT_DIR).isDirectory();
	} catch {
		return false;
	}
};
async function readPostFiles() {
	const names = (await readdir(CONTENT_DIR)).filter((n) => /\.(md|markdown)$/i.test(n) && !/^readme\./i.test(n)).sort();
	return Promise.all(names.map(async (n) => rawFromPostFile(await readFile(path.join(CONTENT_DIR, n), "utf8"), n)));
}

// --------------------------------------------------------------------------
async function writeInert(reason) {
	console.warn(`[redirect-manifest] ${reason} — writing inert manifest`);
	await mkdir(path.dirname(OUT_FILE), { recursive: true });
	await writeFile(OUT_FILE, JSON.stringify({ ok: false, postSlugs: [], sectionSlugs: [] }, null, 2));
}

/** The archive the build serves, from its raw articles (as getPosts orders and caps it). */
function archiveOf(raws) {
	return ensureUniqueSlugs(
		dedupeById(
			raws
				.map(normalize)
				.filter((p) => p !== null)
				.filter(isVisible)
		)
			.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
			.slice(0, POSTS_LIMIT)
	);
}

async function writeManifest(posts) {
	if (posts.length === 0) return writeInert("zero posts");

	const postSlugs = [...new Set(posts.map((p) => p.slug))];
	const sectionSlugs = [...new Set(posts.map((p) => slugify(p.tags[0] || FALLBACK_SECTION)))];

	await mkdir(path.dirname(OUT_FILE), { recursive: true });
	await writeFile(
		OUT_FILE,
		JSON.stringify({ ok: true, postSlugs, sectionSlugs, generatedAt: new Date().toISOString() }, null, 2)
	);
	console.log(`[redirect-manifest] wrote ${postSlugs.length} post + ${sectionSlugs.length} section slugs`);
}

async function main() {
	// A site that keeps its posts as files serves exactly those (src/lib/letterbrace/files.ts).
	if (hasPostFiles()) return writeManifest(archiveOf(await readPostFiles()));
	if (!API_KEY) return writeInert("no LETTERBRACE_API_KEY");

	const search = new URLSearchParams();
	if (COLLECTION_ID) search.set("collection_id", COLLECTION_ID);
	const url = `${API_URL}/published${search.toString() ? `?${search}` : ""}`;

	let posts;
	try {
		const res = await fetch(url, {
			headers: { "x-integrations-key": API_KEY, accept: "application/json" },
			signal: AbortSignal.timeout(20_000),
		});
		if (!res.ok) throw new Error(`API responded ${res.status} ${res.statusText}`);
		const payload = await res.json();
		posts = archiveOf(extractArray(payload));
	} catch (err) {
		return writeInert(`fetch failed: ${err instanceof Error ? err.message : String(err)}`);
	}

	return writeManifest(posts);
}

main().catch(async (err) => {
	// Never fail the build over the manifest.
	try {
		await writeInert(`unexpected error: ${err instanceof Error ? err.message : String(err)}`);
	} catch {
		/* give up silently */
	}
});

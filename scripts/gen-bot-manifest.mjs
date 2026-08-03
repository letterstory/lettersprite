/**
 * Generates `src/generated/bot-manifest.json` — the classifier manifest baked
 * into this build: Letterbrace's bot registry tables plus the day's vendor
 * IP ranges (verification) and cloud CIDRs (provenance).
 *
 * Runs before `next build` (see package.json), fetching ONE url:
 * `${LETTERBRACE_ACCESS_URL}/manifest`, authenticated with the same
 * integrations key the access reports use. Letterbrace is the single fetch
 * point — its daily cron talks to the twenty-odd vendor endpoints so builds
 * (and runtime refreshes) never depend on any of them being up.
 *
 * FAIL-SAFE, same contract as gen-redirect-manifest.mjs: on ANY problem (no
 * env, fetch error, non-2xx, unusable payload) it writes `{ ok: false }` and
 * exits 0. The proxy then classifies with its embedded tables and skips
 * verification/provenance — a bad bake costs naming precision, never a build
 * and never a wrong label.
 *
 * Plain `.mjs` (no TypeScript) so it runs on any Node the build image ships.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = path.join(ROOT, "src", "generated", "bot-manifest.json");

const ACCESS_URL = (process.env.LETTERBRACE_ACCESS_URL ?? "").replace(/\/$/, "");
const API_KEY = process.env.LETTERBRACE_API_KEY ?? "";

async function writeManifest(payload) {
	await mkdir(path.dirname(OUT_FILE), { recursive: true });
	await writeFile(OUT_FILE, `${JSON.stringify(payload)}\n`);
}

async function main() {
	if (!ACCESS_URL || !API_KEY) {
		console.log("[gen-bot-manifest] access url/key not set; writing ok:false (classifier uses embedded tables)");
		await writeManifest({ ok: false });
		return;
	}

	try {
		const res = await fetch(`${ACCESS_URL}/manifest`, {
			headers: { "x-integrations-key": API_KEY },
			signal: AbortSignal.timeout(20000),
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const payload = await res.json();
		if (!payload || payload.ok !== true || !payload.tables || !Array.isArray(payload.tables.aiAgents)) {
			throw new Error("unusable payload shape");
		}
		await writeManifest(payload);
		const v = Object.keys(payload.verification ?? {}).length;
		const p = Object.keys(payload.provenance ?? {}).length;
		console.log(
			`[gen-bot-manifest] baked classifier v${payload.tables.version} (${v} verification labels, ${p} provenance labels)`
		);
	} catch (err) {
		console.warn(`[gen-bot-manifest] ${err instanceof Error ? err.message : String(err)}; writing ok:false`);
		await writeManifest({ ok: false });
	}
}

main();

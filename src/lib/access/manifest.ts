/**
 * The classifier manifest — how this deployment keeps its bot knowledge fresh
 * without ever being redeployed.
 *
 * Three layers, best-available wins, every fallback fail-open:
 *
 *   1. RUNTIME REFRESH — about daily, this module re-fetches the manifest from
 *      Letterbrace (the bot registry + that morning's vendor IP ranges). This
 *      is the longevity story: a bot named in the registry today is being
 *      named HERE tomorrow, on every deployment including ones that haven't
 *      rebuilt in months.
 *   2. BAKED COPY — scripts/gen-bot-manifest.mjs fetches the same payload at
 *      build time into src/generated/, so a cold instance classifies well from
 *      its very first request.
 *   3. EMBEDDED TABLES — classify.ts's snapshot, for a build where the bake
 *      failed AND no refresh has succeeded. UA classification still works;
 *      only range verification/provenance sit out (nothing verifies, which
 *      under-claims and never lies).
 *
 * The refresh runs inside `event.waitUntil` AFTER the response is gone — a
 * reader never waits on it — and its state is module-scope: with Fluid
 * Compute an instance serves many requests, so one fetch a day serves them
 * all. It never throws; a failed attempt leaves the last good manifest in
 * place and backs off until the next TTL window.
 */

import { env } from "@/env";
import { EMBEDDED_TABLES, type ClassifierTables } from "./classify";
import { compileRanges, ipInRangeSet, type RangeSet } from "./ranges";
import bakedManifest from "@/generated/bot-manifest.json";

/** The wire shape GET <access-url>/manifest serves (see Letterbrace's
 *  integrations/phantom-access/manifest route). */
interface ManifestPayload {
	ok: boolean;
	version?: number;
	generatedAt?: string;
	tables?: ClassifierTables;
	verification?: Record<string, string[]>;
	provenance?: Record<string, string[]>;
}

/** Named providers are checked before the generic datacenter catch-all, so a
 *  request from Hetzner says "hetzner", not just "some datacenter". Labels the
 *  registry adds later simply append after the known ones. */
const PROVENANCE_ORDER = [
	"aws",
	"gcp",
	"azure",
	"cloudflare",
	"oracle",
	"digitalocean",
	"hetzner",
	"ovh",
	"linode",
	"alibaba",
	"datacenter",
];

interface CompiledManifest {
	tables: ClassifierTables;
	verification: Map<string, RangeSet>;
	provenance: [label: string, set: RangeSet][];
}

function compile(payload: ManifestPayload): CompiledManifest | null {
	if (!payload.ok || !payload.tables || !Array.isArray(payload.tables.aiAgents)) return null;

	const verification = new Map<string, RangeSet>();
	for (const [label, cidrs] of Object.entries(payload.verification ?? {})) {
		if (Array.isArray(cidrs) && cidrs.length > 0) verification.set(label, compileRanges(cidrs));
	}

	const provEntries = Object.entries(payload.provenance ?? {}).filter(
		([, cidrs]) => Array.isArray(cidrs) && cidrs.length > 0
	);
	const provenance: [string, RangeSet][] = provEntries
		.sort(([a], [b]) => {
			const ia = PROVENANCE_ORDER.indexOf(a);
			const ib = PROVENANCE_ORDER.indexOf(b);
			return (ia === -1 ? PROVENANCE_ORDER.length : ia) - (ib === -1 ? PROVENANCE_ORDER.length : ib);
		})
		.map(([label, cidrs]) => [label, compileRanges(cidrs)]);

	return { tables: payload.tables, verification, provenance };
}

// Module scope: shared across requests on a warm instance, reset on cold start.
// The `unknown` hop matters: this JSON is REGENERATED per build (placeholder
// today, a real payload tomorrow), so its build-time inferred shape is not
// something to trust — `compile()` is what actually validates it, at runtime.
let current: CompiledManifest | null = compile(bakedManifest as unknown as ManifestPayload);
let lastAttemptAt = 0;

const REFRESH_TTL_MS = 24 * 60 * 60 * 1000;
/** Post-response, so latency only holds the invocation open — but the payload
 *  is a couple of MB of CIDRs, so give it more room than the 2s report. */
const REFRESH_TIMEOUT_MS = 8000;

/** The tables the proxy should classify with right now. */
export function activeTables(): ClassifierTables {
	return current?.tables ?? EMBEDDED_TABLES;
}

/** Did this request's IP come from the claimed agent's published ranges?
 *  False when we hold no ranges for the label — verification only ever
 *  under-claims. */
export function verifyAgentIp(ip: string | null | undefined, agent: string): boolean {
	const set = current?.verification.get(agent);
	return !!set && ipInRangeSet(ip, set);
}

/** Which datacenter the packets came from, or '' for "no match" — the only
 *  answer that might mean a person on a home connection. */
export function provenanceOf(ip: string | null | undefined): string {
	if (!current) return "";
	for (const [label, set] of current.provenance) {
		if (ipInRangeSet(ip, set)) return label;
	}
	return "";
}

/**
 * Refresh the manifest if the TTL has lapsed. Resolves quietly on every
 * outcome; the returned promise exists to be handed to `waitUntil`.
 */
export async function refreshManifestIfStale(now: number = Date.now()): Promise<void> {
	if (now - lastAttemptAt < REFRESH_TTL_MS) return;
	if (!env.accessReportUrl || !env.letterbraceApiKey) return;
	// Attempt-time, not success-time: a dead endpoint must not be re-hit on
	// every request for the rest of the day.
	lastAttemptAt = now;

	try {
		const res = await fetch(`${env.accessReportUrl}/manifest`, {
			headers: { "x-integrations-key": env.letterbraceApiKey },
			signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
			cache: "no-store",
		});
		if (!res.ok) {
			console.warn(`[access] manifest refresh rejected: ${res.status}`);
			return;
		}
		const compiled = compile((await res.json()) as ManifestPayload);
		if (compiled) current = compiled;
		else console.warn("[access] manifest refresh returned an unusable payload; keeping previous");
	} catch (err) {
		console.warn(`[access] manifest refresh failed: ${err instanceof Error ? err.message : String(err)}`);
	}
}

/** Test hook: reset module state (cold-start simulation). */
export function __resetManifestForTests(payload?: ManifestPayload): void {
	current = payload ? compile(payload) : compile(bakedManifest as unknown as ManifestPayload);
	lastAttemptAt = 0;
}

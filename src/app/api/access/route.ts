import { NextResponse } from "next/server";
import { env, hasLetterbraceKey } from "@/env";

/**
 * POST /api/access — where the in-page beacon reports.
 *
 * WHY THIS ROUTE EXISTS AT ALL. The browser cannot post to Letterbrace
 * directly: that would require `LETTERBRACE_API_KEY` in client-side JavaScript,
 * where anyone can read it — and that key is scoped to the whole org, so it is
 * not a small leak. The beacon therefore posts same-origin here, and this
 * forwards server-side with the key attached. The key never leaves the server.
 *
 * Everything arriving here is attacker-controlled. It is a public endpoint on a
 * public website with no authentication, because a reader has no credential to
 * offer — so the defence is that nothing it accepts is worth forging: no
 * identity, no money, no state. The worst a forger achieves is a wrong dwell
 * average on one page of one blog.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** A visit longer than this is an abandoned tab. Mirrors the beacon's own cap
 *  — the beacon clamps honestly, this clamps the ones that don't. */
const MAX_SECONDS = 1800;
/** Beacon payloads are a few hundred bytes; anything larger is not a beacon. */
const MAX_BODY = 2048;

const AI_SOURCES = new Set(["chatgpt", "claude", "perplexity", "gemini", "copilot"]);

function clampInt(value: unknown, min: number, max: number): number {
	const n = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : 0;
	return Math.max(min, Math.min(max, n));
}

/** Same rules as Letterbrace's own path normaliser — query and fragment gone,
 *  trailing slash folded, control characters refused. Duplicated deliberately:
 *  the two repos deploy independently, and a path that this accepted and that
 *  rejected would just fail silently one hop later. */
function normalizePath(raw: unknown): string | null {
	if (typeof raw !== "string") return null;
	let path = raw.trim();
	if (!path.startsWith("/") || path.startsWith("//")) return null;
	const cut = path.search(/[?#]/);
	if (cut !== -1) path = path.slice(0, cut);
	path = path.replace(/\/{2,}/g, "/");
	if (path.length > 1) path = path.replace(/\/+$/, "");
	if (path === "") path = "/";
	if (path.length > 512) return null;
	// eslint-disable-next-line no-control-regex
	if (/[\x00-\x1f\x7f]/.test(path)) return null;
	return path;
}

export async function POST(request: Request): Promise<Response> {
	// Inert unless this deployment reports at all — same switch as the proxy, so
	// a site that isn't opted in exposes no collector either.
	if (!env.accessReportUrl || !hasLetterbraceKey) {
		return new NextResponse(null, { status: 204 });
	}

	// A beacon is same-origin by construction. A cross-origin post is either a
	// mistake or someone else's page trying to write into our numbers.
	const origin = request.headers.get("origin");
	if (origin) {
		try {
			if (new URL(origin).host !== new URL(request.url).host) {
				return new NextResponse(null, { status: 204 });
			}
		} catch {
			return new NextResponse(null, { status: 204 });
		}
	}

	let body: unknown;
	try {
		const text = await request.text();
		if (text.length > MAX_BODY) return new NextResponse(null, { status: 204 });
		body = JSON.parse(text);
	} catch {
		return new NextResponse(null, { status: 204 });
	}
	if (typeof body !== "object" || body === null) return new NextResponse(null, { status: 204 });

	const b = body as Record<string, unknown>;
	const path = normalizePath(b.path);
	if (!path) return new NextResponse(null, { status: 204 });

	const from = typeof b.from === "string" && AI_SOURCES.has(b.from) ? b.from : "";

	try {
		await fetch(env.accessReportUrl, {
			method: "POST",
			headers: {
				"x-integrations-key": env.letterbraceApiKey,
				"content-type": "application/json",
			},
			body: JSON.stringify({
				path,
				date: new Date().toISOString().slice(0, 10),
				// A beacon that ran is the only proof a real browser was here — the
				// proxy could only say the user-agent claimed to be one.
				requester_class: "browser",
				agent: "",
				engagement: {
					seconds: clampInt(b.seconds, 0, MAX_SECONDS),
					scroll: clampInt(b.scroll, 0, 100),
					from,
				},
			}),
			signal: AbortSignal.timeout(3000),
			cache: "no-store",
		});
	} catch {
		// Swallowed. Nothing downstream of a page view is worth a 500 on a blog.
	}

	// 204 for every outcome above, valid or not. A beacon discards the response,
	// and distinguishable statuses would only tell a prober what the validator
	// accepts.
	return new NextResponse(null, { status: 204 });
}

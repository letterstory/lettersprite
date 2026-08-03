/**
 * Page-access telemetry.
 *
 * This is the only request-time code in the blog, and it exists for one reason:
 * this site is fully static and served from Vercel's CDN, so by the time HTML
 * reaches a reader there is nothing left to observe. Proxy runs BEFORE the
 * cache is consulted, on every request, which makes it the only place that can
 * see an AI crawler fetch an article — a request that executes no JavaScript,
 * reaches no origin, and appears in no report we hold today.
 *
 * NOTE THE FILE NAME. Next 16 deprecated `middleware.ts` and renamed the
 * convention to `proxy.ts` (exporting `proxy`, defaulting to the Node runtime).
 * Writing this as middleware would still run today but is on its way out, and
 * setting `runtime` in a proxy file is an error rather than an option.
 *
 * Beyond telemetry it makes exactly ONE routing decision, and only a
 * deliberately narrow one: a `/posts/*` or `/sections/*` URL that this build
 * does NOT serve (an old page a re-strategize removed, still indexed by Google)
 * is 308-redirected to the homepage instead of serving a dead 404. The valid
 * slugs are baked in at build time (scripts/gen-redirect-manifest.mjs) — there
 * is NO request-time fetch — and the check is fail-safe: an un-generated or
 * empty manifest, or a path that IS served, passes straight through untouched.
 * A bug here breaks every page on the site at once, so the guards below are
 * intentionally conservative — when in doubt, do not redirect.
 */

import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { classifyRequester } from "@/lib/access/classify";
import { accessReportingEnabled, reportAccess } from "@/lib/access/report";
import redirectManifest from "@/generated/redirect-manifest.json";

// Valid post/section slugs for THIS build (see scripts/gen-redirect-manifest.mjs).
const manifest = redirectManifest as { ok: boolean; postSlugs: string[]; sectionSlugs: string[] };
const POST_SLUGS = new Set(manifest.postSlugs);
const SECTION_SLUGS = new Set(manifest.sectionSlugs);

function safeDecode(segment: string): string {
	try {
		return decodeURIComponent(segment);
	} catch {
		return segment;
	}
}

/**
 * A 308 to the homepage when the path is a `/posts/<slug>` or `/sections/<slug>`
 * this build doesn't serve, else null. Fail-safe: returns null (pass through)
 * unless the manifest generated AND the relevant slug set is non-empty AND the
 * slug is definitively absent — so a valid page can never be redirected.
 */
function removedUrlRedirect(request: NextRequest): NextResponse | null {
	if (!manifest.ok) return null;
	const { pathname } = request.nextUrl;

	const post = /^\/posts\/([^/]+)\/?$/.exec(pathname);
	if (post && POST_SLUGS.size > 0 && !POST_SLUGS.has(safeDecode(post[1]))) {
		return NextResponse.redirect(new URL("/", request.url), 308);
	}
	const section = /^\/sections\/([^/]+)\/?$/.exec(pathname);
	if (section && SECTION_SLUGS.size > 0 && !SECTION_SLUGS.has(safeDecode(section[1]))) {
		return NextResponse.redirect(new URL("/", request.url), 308);
	}
	return null;
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
	// Removed-URL redirect runs first, so it works even on sites where access
	// telemetry is off (which is most of them).
	const redirect = removedUrlRedirect(request);
	if (redirect) return redirect;

	const enabled = accessReportingEnabled();

	// A one-word answer to "is telemetry live on this site?", readable with a
	// single curl against any phantom in the fleet.
	//
	// Without it the two failure modes are indistinguishable from outside: a
	// build with no proxy at all and a proxy whose env was never populated both
	// look like a perfectly normal page. Diagnosing that meant reaching into the
	// Vercel project of whichever site was misbehaving — which needs access to
	// the team that owns 114 of them. Three states, one request:
	//
	//   x-phantom-access: on    reporting
	//   x-phantom-access: off   proxy is deployed, env is not set
	//   (header absent)         this build has no proxy
	//
	// It names no key, no URL and no visitor — just whether the switch is thrown.
	const response = NextResponse.next();
	response.headers.set("x-phantom-access", enabled ? "on" : "off");

	// Cheap exit when the deployment hasn't been configured for reporting, which
	// is every phantom until its env says otherwise.
	if (!enabled) return response;

	// Only GET is a page view. A HEAD is a liveness check and a POST isn't a
	// read at all; counting either would quietly inflate the number.
	if (request.method !== "GET") return response;

	const requester = classifyRequester(request.headers.get("user-agent"));

	// waitUntil keeps the invocation alive for the report without the reader
	// waiting on it. This is the whole reason the response isn't delayed.
	event.waitUntil(reportAccess(request.nextUrl.pathname, requester));

	return response;
}

export const config = {
	/**
	 * Content pages only.
	 *
	 * Every excluded path is excluded for a reason: `_next/static` and
	 * `_next/image` are assets that would multiply one page view into a dozen
	 * "accesses"; `favicon.ico`, `robots.txt`, `sitemap.xml` and `feed.xml` are
	 * fetched by infrastructure and feed readers rather than read by anyone. The
	 * trailing extension clause catches images and fonts in `public/`.
	 *
	 * This matters for cost as well as correctness — proxy is billed per
	 * invocation, and without a matcher it runs on literally every request,
	 * including every CSS file.
	 */
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|feed.xml|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|woff|woff2|ttf|otf|map)$).*)",
	],
};

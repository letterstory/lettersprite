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
 * It does not redirect, rewrite, or alter the response in any way. It reads one
 * header, hands off a report, and returns the request untouched. If this file
 * is ever tempted to make a routing decision, that belongs somewhere else — a
 * bug here breaks every page on the site at once.
 */

import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { classifyRequester } from "@/lib/access/classify";
import { accessReportingEnabled, reportAccess } from "@/lib/access/report";

export function proxy(request: NextRequest, event: NextFetchEvent) {
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

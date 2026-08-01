/**
 * Reporting one page request back to Letterbrace.
 *
 * Three rules govern everything here, in order:
 *
 *   1. NEVER BREAK THE PAGE. This is telemetry on a static marketing site. A
 *      blog that 500s because an analytics endpoint is slow is a far worse
 *      outcome than a missing number, so nothing in this file throws, and the
 *      caller hands it to `waitUntil` rather than awaiting it.
 *   2. NEVER SLOW THE PAGE. The report is fired after the response is on its
 *      way. A reader waits for nothing.
 *   3. STAY OFF UNTIL CONFIGURED. With no reporting URL set, this is inert.
 *      Every phantom already deployed keeps behaving exactly as it does today
 *      until its env says otherwise, which is what makes a fleet rollout a
 *      setting rather than a release.
 */

import { env, hasLetterbraceKey } from "@/env";
import type { Requester } from "./classify";

/** A request that takes longer than this is not worth the compute. The page has
 *  already been served; we are only deciding how long to hold the invocation. */
const REPORT_TIMEOUT_MS = 2000;

/** Is access reporting switched on for this deployment? */
export function accessReportingEnabled(): boolean {
	return Boolean(env.accessReportUrl && hasLetterbraceKey);
}

/**
 * Tell Letterbrace that a page was requested. Resolves either way; never throws.
 *
 * Note what is NOT sent: no IP address, no cookie, no identifier of any kind,
 * and no full URL. A path, a day, and what kind of thing asked. That is enough
 * for every question the feature answers, and it keeps the whole system clear
 * of personal data — which is a design constraint, not an oversight.
 */
export async function reportAccess(path: string, requester: Requester): Promise<void> {
	if (!accessReportingEnabled()) return;

	try {
		const res = await fetch(env.accessReportUrl, {
			method: "POST",
			headers: {
				"x-integrations-key": env.letterbraceApiKey,
				"content-type": "application/json",
			},
			body: JSON.stringify({
				path,
				// The UTC day, decided here rather than at ingest. A request at
				// 23:59 that arrives after midnight belongs to the day it happened.
				date: new Date().toISOString().slice(0, 10),
				requester_class: requester.class,
				agent: requester.agent,
			}),
			signal: AbortSignal.timeout(REPORT_TIMEOUT_MS),
			// This must never be served from a cache, and there is nothing to cache.
			cache: "no-store",
		});

		if (!res.ok) {
			// Logged, not thrown. A 401 here means the key lacks the capability and
			// every request will fail the same way — worth seeing in the function
			// log, worth nothing to the reader waiting for the page.
			console.warn(`[access] report rejected: ${res.status}`);
		}
	} catch (err) {
		// Includes the timeout above. Deliberately swallowed.
		console.warn(`[access] report failed: ${err instanceof Error ? err.message : String(err)}`);
	}
}

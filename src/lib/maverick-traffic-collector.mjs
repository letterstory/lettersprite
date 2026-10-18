/** Server/edge collector. Import only on your server; never expose the key.
 * Call after obtaining the actual response, including cached HTML responses.
 * Use your platform's waitUntil/after mechanism to keep the promise alive.
 */
export async function recordPageResponse(request, response, options) {
  const item = pageRequest(request, options);
  if (!item) return { skipped: true };
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !/^(text\/html|application\/xhtml\+xml)(;|$)/i.test(contentType)) return { skipped: true };
  return deliver({ ...item, observationType: "response", statusCode: response.status, contentType }, options);
}

/** For Next.js Proxy and other pre-response hooks. The caller must identify
 * genuine page routes. Does not claim the eventual response succeeded.
 * Use this OR recordPageResponse for a request, never both.
 */
export async function recordPageRequest(request, options) {
  if (options.isPageRequest !== true) return { skipped: true };
  const item = pageRequest(request, options);
  return item ? deliver({ ...item, observationType: "request" }, options) : { skipped: true };
}

function pageRequest(request, options) {
  const { apiKey, allowedHosts, eventId = crypto.randomUUID(),
    timestamp = new Date().toISOString(), visitorId, sessionId } = options;
  if (!apiKey || !Array.isArray(allowedHosts) || !allowedHosts.length) return null;
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  if (!allowedHosts.some(host => host.toLowerCase().replace(/^www\./, "") === hostname)) return null;
  const purpose = `${request.headers.get("purpose") || ""} ${request.headers.get("sec-purpose") || ""}`;
  if (request.method !== "GET" || /^\/(api|_next)(\/|$)/.test(url.pathname)
      || /prefetch/i.test(purpose) || request.headers.has("next-router-prefetch") || request.headers.has("rsc")) {
    return null;
  }
  const userAgent = request.headers.get("user-agent");
  if (!userAgent || userAgent.length > 1024) return null;
  url.search = "";
  url.hash = "";
  return { eventId, timestamp, url: url.href, userAgent, method: "GET",
    ...(visitorId ? { visitorId } : {}), ...(sessionId ? { sessionId } : {}) };
}

async function deliver(item, { apiKey, fetchImpl = fetch }) {
  const body = JSON.stringify({ events: [item] });
  // Reuse the exact event ID, timestamp and body after an uncertain response.
  // At higher volumes enqueue events and flush batches of up to 100 instead.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await fetchImpl("https://api-v1.maverickintelligence.co/v1/traffic/events", {
        method: "POST", headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
        body, signal: AbortSignal.timeout(5000), redirect: "error",
      });
      if (result.ok) return await result.json();
      if (result.status < 500 || attempt === 1) return { error: true, status: result.status };
    } catch {
      if (attempt === 1) return { error: true, status: null };
    }
  }
}

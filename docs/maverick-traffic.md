# Per-page human and AI traffic

The browser pixel supplies human page views, including anonymous visitors.
This optional connector forwards page requests from the existing Next.js
Proxy so crawlers that do not execute JavaScript can be counted. It is
independent of Letterbrace access telemetry.

After Maverick's traffic API is deployed, enable an opted-in site:

1. Register its hostname under the Letter Maverick account and correct customer
   domain group. Keep the existing `MAVERICK_CUSTOMER_ID` pixel setting.
2. Create a **domain-scoped data key** (`mk_live_...`). Store it only in the
   site's server secret `MAVERICK_TRAFFIC_KEY`.
3. Set `SITE_URL` to its registered public URL and
   `MAVERICK_TRAFFIC_ENABLED=true`, then deploy.
4. Verify a real page request appears in
   `GET https://api-v1.maverickintelligence.co/v1/traffic/pages?domain=YOUR_HOST`
   using a backend data key. Check `meta.coverage.server.pageRequests` and
   `ai.requests`/`ai.byAgent`. A website HTTP 200 alone does not prove delivery.
   Keep synthetic checks separate from customer traffic.

The builder can use `domain_group_id`, `since`, `until`, `path`, `agent` and
`include_people=true` to populate analytics. Resolve the authenticated customer's
group server-side, never from an arbitrary browser-supplied group ID with an
account-wide key. See the [API guide](https://app.maverickintelligence.co/partner-api).

Pre-response observations increment `ai.requests`, without claiming the
eventual response succeeded. `ai.pageViews` requires an actual successful HTML
response, which Proxy cannot observe. Human counts default to browser activity
and include unidentified visitors. The sources are never added together.

The connector sends the original User-Agent, sanitized hostname/path, event ID
and timestamp. It sends no IP, email, cookie or visitor identifier. Query
strings, fragments, assets, APIs, prefetches and RSC-only requests are excluded.
Agent labels are User-Agent claims; browser-like agents may remain unidentified.

Forwarding runs in `waitUntil`, retries transient failures once using the same
event ID and timestamp, and logs status-only errors. It is best effort. At high
volume, use a durable queue and batches of up to 100 events; the data API limit
is 1,000 requests/hour per scoped key. Disable with
`MAVERICK_TRAFFIC_ENABLED=false`. Maverick also rejects collection for paused,
held, archived, unregistered and out-of-scope sites.

No credentials are committed and no sites are enabled by this code change.

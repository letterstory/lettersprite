/** Optional server-only forwarding, independent of Letterbrace telemetry. */
import { env } from "@/env";
import { recordPageRequest } from "./maverick-traffic-collector.mjs";

export function maverickTrafficEnabled(): boolean {
  return Boolean(env.maverickTrafficEnabled && env.maverickCustomerId
    && env.maverickTrafficKey.startsWith("mk_live_"));
}

export async function reportMaverickPageRequest(request: Request): Promise<void> {
  if (!maverickTrafficEnabled()) return;
  try {
    if (/\.[^/]+$/.test(new URL(request.url).pathname)) return;
    const result = await recordPageRequest(request, {
      apiKey: env.maverickTrafficKey,
      // Deployment configuration, never the caller's Host header.
      allowedHosts: [new URL(env.siteUrl).hostname],
      isPageRequest: true,
    });
    if (result.error) console.warn("[maverick-traffic] report failed", result.status);
  } catch {
    // Never log keys, URLs, IPs, cookies or request bodies.
    console.warn("[maverick-traffic] report unavailable");
  }
}

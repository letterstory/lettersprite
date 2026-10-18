import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/env", () => ({ env: {
  maverickTrafficEnabled: false, maverickTrafficKey: "", maverickCustomerId: "",
  siteUrl: "https://letter.company",
} }));
import { env } from "@/env";
import { reportMaverickPageRequest } from "./maverick-traffic";

const request = (url = "https://letter.company/posts/example?private=remove", headers = {}) =>
  new Request(url, { headers: { "user-agent": "GPTBot/1.2", ...headers } });

describe("Maverick page-request forwarding", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    Object.assign(env, { maverickTrafficEnabled: true, maverickTrafficKey: "mk_live_test-only",
      maverickCustomerId: "1091", siteUrl: "https://letter.company" });
    fetchMock.mockReset().mockResolvedValue(Response.json({ data: { accepted: 1 } }, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("stays off unless account, data key and explicit flag are set", async () => {
    Object.assign(env, { maverickTrafficEnabled: false });
    await reportMaverickPageRequest(request());
    Object.assign(env, { maverickTrafficEnabled: true, maverickTrafficKey: "pk_live_management-key" });
    await reportMaverickPageRequest(request());
    Object.assign(env, { maverickTrafficKey: "mk_live_test-only", maverickCustomerId: "" });
    await reportMaverickPageRequest(request());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports original UA and page path without guessing response success", async () => {
    await reportMaverickPageRequest(request());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api-v1.maverickintelligence.co/v1/traffic/events");
    const item = JSON.parse(init.body).events[0];
    expect(item.url).toBe("https://letter.company/posts/example");
    expect(item.userAgent).toBe("GPTBot/1.2");
    expect(item.observationType).toBe("request");
    for (const field of ["statusCode", "contentType", "ip", "visitorId"])
      expect(item[field]).toBeUndefined();
  });

  it("rejects another host, assets, APIs, prefetches and RSC-only requests", async () => {
    for (const req of [request("https://foreign.test/"), request("https://letter.company/image.png"),
      request("https://letter.company/api/data"), request(undefined, { "next-router-prefetch": "1" }),
      request(undefined, { purpose: "prefetch" }), request(undefined, { rsc: "1" })])
      await reportMaverickPageRequest(req);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("cannot break a page when analytics is unavailable", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    fetchMock.mockRejectedValue(new Error("network"));
    await expect(reportMaverickPageRequest(request())).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    warning.mockRestore();
  });
});

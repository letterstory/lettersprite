import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/env", () => ({
  env: { accessReportUrl: "https://letterbrace.test/api/integrations/phantom-access", letterbraceApiKey: "k" },
  hasLetterbraceKey: true,
}));
vi.mock("./manifest", () => ({ activeVersion: () => 7 }));

import { reportAccess } from "./report";

/** What the proxy sends Letterbrace: a non-browser's own User-Agent rides along
 *  (Letterbrace forwards it to Maverick); a browser's never does. */
describe("reportAccess", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  const sent = () => JSON.parse(fetchMock.mock.calls[0][1].body);

  it("sends a bot's User-Agent", async () => {
    await reportAccess(
      "/p",
      { class: "ai_agent", agent: "claude", purpose: "live", token: "claude-user" },
      { verified: true, provenance: "", botToken: "", userAgent: "Claude-User/1.0" },
    );
    expect(sent()).toMatchObject({ path: "/p", requester_class: "ai_agent", user_agent: "Claude-User/1.0" });
  });

  it("never sends one for a browser", async () => {
    await reportAccess(
      "/p",
      { class: "browser", agent: "", purpose: "", token: "" },
      { verified: false, provenance: "", botToken: "", userAgent: "" },
    );
    expect(sent()).not.toHaveProperty("user_agent");
  });
});

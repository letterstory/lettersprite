import { describe, it, expect } from "vitest";
import { compileRanges } from "./ranges";
import { vendorForIp } from "./manifest";

// IP-first attribution: an unnamed requester inside an AI vendor's published
// ranges is that vendor. Only the allowed (AI-agent) labels may be minted.
describe("vendorForIp", () => {
  const verification = new Map([
    ["chatgpt", compileRanges(["203.0.113.0/24"])],
    ["google", compileRanges(["198.51.100.0/24"])], // Googlebot: a search crawler's ranges
  ]);
  const aiLabels = new Set(["chatgpt", "claude", "gemini"]);

  it("names the vendor whose ranges hold the IP", () => {
    expect(vendorForIp("203.0.113.7", verification, aiLabels)).toBe("chatgpt");
  });

  it("never mints an AI label from a search crawler's ranges", () => {
    expect(vendorForIp("198.51.100.7", verification, aiLabels)).toBe("");
  });

  it("is empty for an IP outside every range, and for no IP", () => {
    expect(vendorForIp("192.0.2.1", verification, aiLabels)).toBe("");
    expect(vendorForIp(null, verification, aiLabels)).toBe("");
  });
});

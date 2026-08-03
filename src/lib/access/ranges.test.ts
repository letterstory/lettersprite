import { describe, it, expect } from "vitest";
import { compileRanges, ipInRangeSet, parseIp } from "./ranges";
import { __resetManifestForTests, provenanceOf, verifyAgentIp, activeTables } from "./manifest";
import { EMBEDDED_TABLES } from "./classify";

describe("parseIp", () => {
	it("parses v4, v6, and v4-mapped v6", () => {
		expect(parseIp("1.2.3.4")).toEqual({ v: 4, n: (1 << 24) + (2 << 16) + (3 << 8) + 4 });
		expect(parseIp("2a09:bac0::12")?.v).toBe(6);
		// Some proxies hand the client address in mapped form; it must match V4 ranges.
		expect(parseIp("::ffff:1.2.3.4")).toEqual({ v: 4, n: (1 << 24) + (2 << 16) + (3 << 8) + 4 });
	});

	it("rejects junk without throwing — a bad header is a missing label, not an error", () => {
		for (const bad of ["", null, undefined, "999.1.1.1", "not-an-ip", ":::", "1.2.3.4.5"]) {
			expect(parseIp(bad)).toBeNull();
		}
	});
});

describe("compileRanges + ipInRangeSet", () => {
	// Real prefixes from OpenAI's published gptbot.json shape.
	const set = compileRanges(["20.171.207.0/24", "52.230.152.0/24", "2a09:bac0::/32"]);

	it("matches inside a v4 prefix, including both boundaries", () => {
		expect(ipInRangeSet("20.171.207.0", set)).toBe(true);
		expect(ipInRangeSet("20.171.207.128", set)).toBe(true);
		expect(ipInRangeSet("20.171.207.255", set)).toBe(true);
	});

	it("misses just outside the boundary", () => {
		expect(ipInRangeSet("20.171.206.255", set)).toBe(false);
		expect(ipInRangeSet("20.171.208.0", set)).toBe(false);
	});

	it("matches v6 prefixes", () => {
		expect(ipInRangeSet("2a09:bac0:1234::99", set)).toBe(true);
		expect(ipInRangeSet("2a09:bac1::1", set)).toBe(false);
	});

	it("skips junk CIDRs while keeping the good ones", () => {
		const mixed = compileRanges(["garbage", "300.0.0.0/8", "10.0.0.0/8", "10.0.0.0/99"]);
		expect(ipInRangeSet("10.1.2.3", mixed)).toBe(true);
		expect(mixed.v4).toHaveLength(1);
	});

	it("handles a large sorted set with binary search (spot check)", () => {
		const many = compileRanges(Array.from({ length: 5000 }, (_, i) => `10.${Math.floor(i / 250)}.${i % 250}.0/24`));
		expect(ipInRangeSet("10.3.100.7", many)).toBe(true);
		expect(ipInRangeSet("11.0.0.1", many)).toBe(false);
	});
});

describe("manifest verify/provenance", () => {
	const payload = {
		ok: true,
		tables: EMBEDDED_TABLES,
		verification: { chatgpt: ["20.171.0.0/16"] },
		provenance: { aws: ["3.0.0.0/8"], datacenter: ["3.0.0.0/8", "5.9.0.0/16"] },
	};

	it("verifies a claimed agent only from its own vendor's ranges", () => {
		__resetManifestForTests(payload);
		expect(verifyAgentIp("20.171.5.9", "chatgpt")).toBe(true);
		expect(verifyAgentIp("8.8.8.8", "chatgpt")).toBe(false);
		// No ranges held for claude → false, never a guess.
		expect(verifyAgentIp("20.171.5.9", "claude")).toBe(false);
	});

	it("prefers the NAMED provider over the generic datacenter catch-all", () => {
		__resetManifestForTests(payload);
		expect(provenanceOf("3.1.2.3")).toBe("aws"); // in both lists — named wins
		expect(provenanceOf("5.9.1.2")).toBe("datacenter"); // only in the catch-all
		expect(provenanceOf("203.0.113.7")).toBe(""); // matched nowhere: maybe a person
	});

	it("serves embedded tables when the baked manifest is ok:false", () => {
		__resetManifestForTests(); // the committed placeholder is { ok: false }
		expect(activeTables()).toEqual(EMBEDDED_TABLES);
		expect(verifyAgentIp("20.171.5.9", "chatgpt")).toBe(false);
		expect(provenanceOf("3.1.2.3")).toBe("");
	});
});

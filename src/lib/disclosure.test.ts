import { describe, expect, it } from "vitest";
import { disclosedDescription, headerLine, prefixed, siteDisclosure, siteStatement } from "./disclosure";
import type { DisclosureSurface, Post, SponsorDisclosure } from "./letterbrace/types";

const disclosure = (surfaces: DisclosureSurface[], sponsor = "Acme"): SponsorDisclosure => ({
  surfaces,
  sponsor: { name: sponsor, url: null },
  text: `This article is sponsored by ${sponsor}.`,
  label: `Sponsored by ${sponsor}`,
  siteText: `This publication is sponsored by ${sponsor}.`,
  aiLabel: surfaces.includes("ai_authorship") ? "Written with AI" : null,
  aiText: surfaces.includes("ai_authorship") ? "This publication's articles are written with AI." : null,
});

const post = (id: string, createdAt: string | null, sponsorDisclosure: SponsorDisclosure | null): Post => ({
  id,
  slug: id,
  title: id,
  content: "",
  excerpt: "",
  dek: null,
  status: "published",
  author: null,
  authorSlug: null,
  authorProfile: null,
  coverImage: null,
  coverImageAlt: null,
  coverCredit: null,
  tags: [],
  createdAt,
  updatedAt: null,
  paperTrail: [],
  sponsorDisclosure,
});

describe("headerLine", () => {
  it("is the label, joined by the AI label under ai_authorship", () => {
    expect(headerLine(disclosure(["article_header"]))).toBe("Sponsored by Acme");
    expect(headerLine(disclosure(["article_header", "ai_authorship"]))).toBe("Sponsored by Acme · Written with AI");
  });

  it("is null unless article_header is listed", () => {
    expect(headerLine(disclosure(["article_footer", "ai_authorship"]))).toBeNull();
    expect(headerLine(null)).toBeNull();
  });
});

describe("disclosedDescription", () => {
  it("leads with the label as its own sentence when meta_description is listed", () => {
    expect(disclosedDescription(disclosure(["meta_description"]), "An excerpt.")).toBe("Sponsored by Acme. An excerpt.");
    expect(disclosedDescription(disclosure(["meta_description"]), "")).toBe("Sponsored by Acme.");
  });

  it("adds no second stop to a label that ends a sentence", () => {
    expect(prefixed("Sponsored by Acme Inc.", "An excerpt.")).toBe("Sponsored by Acme Inc. An excerpt.");
  });

  it("is the plain description otherwise", () => {
    expect(disclosedDescription(disclosure(["article_footer"]), "An excerpt.")).toBe("An excerpt.");
    expect(disclosedDescription(null, "")).toBeUndefined();
  });
});

describe("siteDisclosure", () => {
  it("is the most recently published post's disclosure that lists site_statement", () => {
    const posts = [
      post("old", "2026-01-01T00:00:00Z", disclosure(["site_statement"], "Old Co")),
      post("undated", null, disclosure(["site_statement"], "Undated Co")),
      post("newest-no-statement", "2026-03-01T00:00:00Z", disclosure(["article_footer"], "Footer Co")),
      post("new", "2026-02-01T00:00:00Z", disclosure(["site_statement", "ai_authorship"], "New Co")),
    ];
    expect(siteDisclosure(posts)?.sponsor.name).toBe("New Co");
    expect(siteStatement(siteDisclosure(posts))).toBe(
      "This publication is sponsored by New Co. This publication's articles are written with AI.",
    );
  });

  it("is null when no post lists site_statement", () => {
    expect(siteDisclosure([post("a", null, disclosure(["article_footer"])), post("b", null, null)])).toBeNull();
    expect(siteStatement(null)).toBe("");
  });
});

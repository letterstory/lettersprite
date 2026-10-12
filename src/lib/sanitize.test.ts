import { describe, it, expect } from "vitest";
import { sanitizePostHtml } from "./sanitize";
import type { SponsorDisclosure } from "./letterbrace/types";

const disclosure = (
  url: string | null,
  surfaces: SponsorDisclosure["surfaces"] = ["sponsored_links"],
): SponsorDisclosure => ({
  surfaces,
  sponsor: { name: "Acme", url },
  text: "This article is sponsored by Acme.",
  badgeText: "Sponsored by Acme",
});

/** The rel of the first link in sanitized `html`. */
function relOf(html: string, d: SponsorDisclosure | null): string | undefined {
  return /<a\b[^>]*\brel="([^"]*)"/.exec(sanitizePostHtml(html, d))?.[1];
}

const link = (href: string, rel?: string) =>
  `<p><a href="${href}"${rel ? ` rel="${rel}"` : ""}>x</a></p>`;

describe("sanitizePostHtml — rel=\"sponsored\"", () => {
  it("marks a link to the sponsor's host, keeping the outbound rel", () => {
    expect(relOf(link("https://acme.com/pricing"), disclosure("https://acme.com"))).toBe(
      "noopener noreferrer nofollow sponsored",
    );
  });

  it("ignores www. on either side", () => {
    expect(relOf(link("https://acme.com/a"), disclosure("https://www.acme.com"))).toContain("sponsored");
    expect(relOf(link("https://www.acme.com/a"), disclosure("https://acme.com/about"))).toContain(
      "sponsored",
    );
  });

  it("marks a subdomain of the sponsor's host", () => {
    expect(relOf(link("https://docs.acme.com/start"), disclosure("https://acme.com"))).toContain(
      "sponsored",
    );
    expect(relOf(link("//blog.acme.com/post"), disclosure("https://acme.com"))).toContain("sponsored");
  });

  it("leaves other hosts untouched, including look-alikes", () => {
    const d = disclosure("https://acme.com");
    expect(relOf(link("https://example.org/"), d)).toBe("noopener noreferrer nofollow");
    expect(relOf(link("https://notacme.com/"), d)).toBe("noopener noreferrer nofollow");
    expect(relOf(link("https://acme.com.evil.io/"), d)).toBe("noopener noreferrer nofollow");
    expect(relOf(link("/posts/acme"), d)).toBe("noopener");
    expect(relOf(link("mailto:hi@acme.com"), d)).toBe("noopener noreferrer nofollow");
  });

  it("merges into the existing rel without duplicating a token", () => {
    const rel = relOf(link("https://acme.com/", "sponsored noopener"), disclosure("https://acme.com"));
    expect(rel?.split(" ").sort()).toEqual(["nofollow", "noopener", "noreferrer", "sponsored"]);
  });

  it("does nothing when sponsored_links is off, the url is null, or nothing is disclosed", () => {
    const off = disclosure("https://acme.com", ["article_footer", "structured_data"]);
    expect(relOf(link("https://acme.com/"), off)).toBe("noopener noreferrer nofollow");
    expect(relOf(link("https://acme.com/"), disclosure(null))).toBe("noopener noreferrer nofollow");
    expect(relOf(link("https://acme.com/"), null)).toBe("noopener noreferrer nofollow");
    expect(sanitizePostHtml(link("https://acme.com/"))).toBe(sanitizePostHtml(link("https://acme.com/"), null));
  });
});

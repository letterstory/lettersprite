import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DisclosureLabel } from "@/components/DisclosureLabel";
import { SiteDisclosure } from "@/components/SiteDisclosure";
import { SponsorBadge } from "@/components/SponsorBadge";
import { SponsorDisclosure } from "@/components/SponsorDisclosure";
import type { SponsorDisclosure as Disclosure } from "@/lib/letterbrace/types";
import { classesOf, strippedClasses } from "./readability-patterns";

/**
 * Reader modes and most AI page extractors are built on Mozilla Readability, which
 * deletes any element whose class or id looks like an ad. "sponsor" is on that list,
 * so a disclosure styled `.sponsor-disclosure` vanished from every extraction: the
 * article read clean, with no sponsor line (checked against @mozilla/readability 0.6
 * on a real disclosed page). A class that matches its patterns (readability-patterns.ts)
 * never reaches a reader or an agent that extracts the article; one that reads like a
 * byline is lifted out of the text as metadata.
 */

const disclosure: Disclosure = {
  surfaces: [
    "article_header",
    "article_footer",
    "cover_badge",
    "structured_data",
    "sponsored_links",
    "meta_description",
    "site_statement",
    "ai_authorship",
  ],
  sponsor: { name: "Acme", url: "https://acme.com" },
  text: "This article is sponsored by Acme.",
  label: "Sponsored by Acme",
  siteText: "This publication is sponsored by Acme.",
  aiLabel: "Written with AI",
  aiText: "This publication's articles are written with AI.",
};

describe("disclosure markup survives reader-mode extraction", () => {
  it.each([
    ["footer line", renderToStaticMarkup(<SponsorDisclosure disclosure={disclosure} />)],
    ["cover badge", renderToStaticMarkup(<SponsorBadge disclosure={disclosure} />)],
    ["inline badge", renderToStaticMarkup(<SponsorBadge disclosure={disclosure} inline />)],
    ["header label", renderToStaticMarkup(<DisclosureLabel disclosure={disclosure} />)],
    ["site statement", renderToStaticMarkup(<SiteDisclosure disclosure={disclosure} />)],
  ])("the %s carries no class Readability strips", (_name, html) => {
    expect(classesOf(html).length).toBeGreaterThan(0);
    expect(strippedClasses(html)).toEqual([]);
  });

  it("the cover's positioning frame is not stripped either (it holds the image)", () => {
    expect(strippedClasses('<div class="disclosure-frame"></div>')).toEqual([]);
  });

  // The guard itself: these are the names the disclosure must never carry.
  it("catches the classes a disclosure must not use", () => {
    expect(
      strippedClasses('<p class="sponsor-line post-meta site-footer article-header s-byline"></p>'),
    ).toEqual(["sponsor-line", "post-meta", "site-footer", "article-header", "s-byline"]);
  });
});

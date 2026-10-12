import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SponsorBadge } from "@/components/SponsorBadge";
import { SponsorDisclosure } from "@/components/SponsorDisclosure";
import type { SponsorDisclosure as Disclosure } from "@/lib/letterbrace/types";

/**
 * Reader modes and most AI page extractors are built on Mozilla Readability, which
 * deletes any element whose class or id looks like an ad. "sponsor" is on that list,
 * so a disclosure styled `.sponsor-disclosure` vanished from every extraction: the
 * article read clean, with no sponsor line (checked against @mozilla/readability 0.6
 * on a real disclosed page). These are its two patterns, copied verbatim; a class that
 * matches either never reaches a reader or an agent that extracts the article.
 */
const UNLIKELY =
  /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i;
const NEGATIVE =
  /-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|footer|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|widget/i;

const disclosure: Disclosure = {
  surfaces: [
    "article_footer",
    "cover_badge",
    "structured_data",
    "sponsored_links",
  ],
  sponsor: { name: "Acme", url: "https://acme.com" },
  text: "This article is sponsored by Acme.",
  badgeText: "Sponsored by Acme",
};

function classesOf(html: string): string[] {
  return [...html.matchAll(/class="([^"]*)"/g)]
    .flatMap((m) => m[1].split(/\s+/))
    .filter(Boolean);
}

describe("disclosure markup survives reader-mode extraction", () => {
  it.each([
    [
      "footer line",
      renderToStaticMarkup(<SponsorDisclosure disclosure={disclosure} />),
    ],
    [
      "cover badge",
      renderToStaticMarkup(<SponsorBadge disclosure={disclosure} />),
    ],
    [
      "inline badge",
      renderToStaticMarkup(<SponsorBadge disclosure={disclosure} inline />),
    ],
  ])("the %s carries no class Readability strips", (_name, html) => {
    const classes = classesOf(html);
    expect(classes.length).toBeGreaterThan(0);
    for (const c of classes) {
      expect(UNLIKELY.test(c), c).toBe(false);
      expect(NEGATIVE.test(c), c).toBe(false);
    }
  });

  it("the cover's positioning frame is not stripped either (it holds the image)", () => {
    expect(
      UNLIKELY.test("disclosure-frame") || NEGATIVE.test("disclosure-frame"),
    ).toBe(false);
  });
});

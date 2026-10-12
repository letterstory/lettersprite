import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SponsorBadge } from "@/components/SponsorBadge";
import type { SponsorDisclosure } from "@/lib/letterbrace/types";

const d = (surfaces: SponsorDisclosure["surfaces"]): SponsorDisclosure => ({
  surfaces,
  sponsor: { name: "Acme", url: null },
  text: "This article is sponsored by Acme.",
  label: "Sponsored by Acme",
  siteText: "This publication is sponsored by Acme.",
});

describe("SponsorBadge", () => {
  it("sets the badge over a cover under cover_badge", () => {
    expect(
      renderToStaticMarkup(<SponsorBadge disclosure={d(["cover_badge"])} />),
    ).toContain("Sponsored by Acme");
  });

  // The label is already in the picture: a second one on top would double it.
  it("sets nothing over a cover whose label is baked in", () => {
    expect(
      renderToStaticMarkup(<SponsorBadge disclosure={d(["cover_baked"])} />),
    ).toBe("");
  });

  // A layout with no cover keeps the choice to disclose on the cover, inline.
  it("still sets the inline label in a layout with no cover", () => {
    expect(
      renderToStaticMarkup(
        <SponsorBadge disclosure={d(["cover_baked"])} inline />,
      ),
    ).toContain("Sponsored by Acme");
  });
});

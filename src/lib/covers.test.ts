import { afterEach, describe, expect, it, vi } from "vitest";
import type { Post, SponsorDisclosure } from "@/lib/letterbrace/types";

/**
 * A cover with the sponsor disclosure drawn in (`cover_baked`) is the cover to show on
 * every theme, including the ones that normally swap in curated stock photos: the
 * swap would drop the disclosure with the picture.
 */
const theme = { name: "bourse", features: { stockCovers: true } };
vi.mock("@/themes", () => ({ getActiveTheme: () => theme }));
vi.mock("./stock-covers", () => ({
  stockCoverFor: () => "https://stock.example/photo.jpg",
}));

const { coverImageFor, coverAltFor } = await import("@/lib/covers");

const baked: SponsorDisclosure = {
  surfaces: ["cover_baked"],
  sponsor: { name: "Acme", url: null },
  text: "This article is sponsored by Acme.",
  label: "Sponsored by Acme",
  siteText: "This publication is sponsored by Acme.",
};

function post(disclosure: SponsorDisclosure | null): Post {
  return {
    title: "T",
    slug: "t",
    coverImage: "https://app.x/api/integrations/covers/disclosed/a-1?v=1",
    coverImageAlt: "Servers",
    sponsorDisclosure: disclosure,
  } as unknown as Post;
}

afterEach(() => vi.clearAllMocks());

describe("coverImageFor — cover_baked", () => {
  it("shows the baked cover even on a stock-cover theme", () => {
    expect(coverImageFor(post(baked), 1200)).toBe(
      "https://app.x/api/integrations/covers/disclosed/a-1?v=1",
    );
    expect(coverAltFor(post(baked))).toBe("Servers");
  });

  it("leaves a stock-cover theme alone without it", () => {
    expect(coverImageFor(post(null), 1200)).toBe(
      "https://stock.example/photo.jpg",
    );
  });
});

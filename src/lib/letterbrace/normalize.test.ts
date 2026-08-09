import { describe, it, expect } from "vitest";
import { normalizePost } from "./normalize";

const base = { id: "a1", title: "Choosing a Wedding Venue", content: "<p>x</p>" };

const attribution = {
  source: "unsplash",
  photographer: "Ada Lovelace",
  photographerUrl: "https://unsplash.com/@ada",
  sourceUrl: "https://unsplash.com/photos/abc",
  license: "unsplash",
  required: true,
};

describe("normalizePost — cover credit", () => {
  it("reads the flat cover_image_credit Letterbrace ships", () => {
    const post = normalizePost({
      ...base,
      cover_image: "https://cdn.example.com/a.jpg",
      cover_image_credit: attribution,
    });
    expect(post?.coverCredit).toEqual({
      source: "unsplash",
      photographer: "Ada Lovelace",
      photographerUrl: "https://unsplash.com/@ada",
      sourceUrl: "https://unsplash.com/photos/abc",
      license: "unsplash",
      required: true,
    });
  });

  it("falls back to the attribution carried on metadata.cover_image", () => {
    const post = normalizePost({
      ...base,
      metadata: {
        cover_image: { url: "https://cdn.example.com/a.jpg", attribution },
      },
    });
    expect(post?.coverCredit?.photographer).toBe("Ada Lovelace");
  });

  // The single most damaging failure here: coverImageFor() silently substitutes
  // a locally generated pattern when there's no cover, so a stray credit would
  // name a photographer for artwork the site drew itself.
  it("drops the credit when there is no cover image to credit", () => {
    const post = normalizePost({ ...base, cover_image_credit: attribution });
    expect(post?.coverImage).toBeNull();
    expect(post?.coverCredit).toBeNull();
  });

  it("is null for a cover with no attribution at all", () => {
    const post = normalizePost({
      ...base,
      metadata: { cover_image: { url: "https://cdn.example.com/a.jpg" } },
    });
    expect(post?.coverCredit).toBeNull();
  });

  // Pexels and CC0 owe nothing. The flag still has to survive normalization so
  // the renderer — not this layer — decides what a site chooses to show.
  it("preserves required: false rather than discarding the credit", () => {
    const post = normalizePost({
      ...base,
      cover_image: "https://cdn.example.com/a.jpg",
      cover_image_credit: { ...attribution, source: "pexels", required: false },
    });
    expect(post?.coverCredit?.required).toBe(false);
    expect(post?.coverCredit?.source).toBe("pexels");
  });

  it("needs a source — an attribution without one credits nobody", () => {
    const post = normalizePost({
      ...base,
      cover_image: "https://cdn.example.com/a.jpg",
      cover_image_credit: { photographer: "Ada Lovelace", required: true },
    });
    expect(post?.coverCredit).toBeNull();
  });

  it("degrades a photographer-less CC-BY photo to source and licence", () => {
    const post = normalizePost({
      ...base,
      cover_image: "https://cdn.example.com/a.jpg",
      cover_image_credit: {
        source: "openverse",
        photographer: "   ",
        photographerUrl: null,
        sourceUrl: "https://openverse.org/image/xyz",
        license: "by-sa",
        required: true,
      },
    });
    expect(post?.coverCredit).toEqual({
      source: "openverse",
      photographer: null,
      photographerUrl: null,
      sourceUrl: "https://openverse.org/image/xyz",
      license: "by-sa",
      required: true,
    });
  });

  it("survives a malformed credit without breaking the post", () => {
    const post = normalizePost({
      ...base,
      cover_image: "https://cdn.example.com/a.jpg",
      cover_image_credit: "unsplash",
    });
    expect(post?.title).toBe("Choosing a Wedding Venue");
    expect(post?.coverCredit).toBeNull();
  });
});

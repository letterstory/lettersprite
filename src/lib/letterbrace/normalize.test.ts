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

describe("normalizePost — author bank", () => {
  const profile = {
    name: "Ines Moreau",
    slug: "ines-moreau-7",
    bio: "  Ines writes about infrastructure.  ",
    role: "Senior Writer",
    expertise: ["infrastructure", "", 42, "cloud"],
    started_at: "2021-03-15",
  };

  it("reads author_slug and author_profile", () => {
    const post = normalizePost({
      ...base,
      author: "Ines Moreau",
      author_slug: "ines-moreau-7",
      author_profile: profile,
    });
    expect(post?.author).toBe("Ines Moreau");
    expect(post?.authorSlug).toBe("ines-moreau-7");
    expect(post?.authorProfile).toEqual({
      name: "Ines Moreau",
      slug: "ines-moreau-7",
      bio: "Ines writes about infrastructure.",
      role: "Senior Writer",
      expertise: ["infrastructure", "42", "cloud"],
      startedAt: "2021-03-15",
    });
  });

  it("is null for legacy free-form bylines and older payloads", () => {
    const legacy = normalizePost({ ...base, author: "Jane Doe", author_profile: null });
    expect(legacy?.author).toBe("Jane Doe");
    expect(legacy?.authorSlug).toBeNull();
    expect(legacy?.authorProfile).toBeNull();
    const old = normalizePost(base);
    expect(old?.authorSlug).toBeNull();
    expect(old?.authorProfile).toBeNull();
  });

  it("tolerates a sparse profile and fills the author name from it", () => {
    const post = normalizePost({
      ...base,
      author_slug: "ines-moreau-7",
      author_profile: { name: "Ines Moreau", role: null, started_at: "not a date" },
    });
    expect(post?.author).toBe("Ines Moreau");
    expect(post?.authorProfile).toEqual({
      name: "Ines Moreau",
      slug: "ines-moreau-7",
      bio: "",
      role: null,
      expertise: [],
      startedAt: null,
    });
  });

  it("drops a profile with no usable name", () => {
    const post = normalizePost({ ...base, author_profile: { name: "undefined", slug: "x" } });
    expect(post?.authorProfile).toBeNull();
    expect(post?.author).toBeNull();
  });
});

describe("normalizePost — sponsor disclosure", () => {
  const disclosure = {
    surfaces: [
      "article_header",
      "article_footer",
      "cover_badge",
      "structured_data",
      "sponsored_links",
      "meta_description",
      "site_statement",
      "site_byline",
    ],
    sponsor: { name: "Acme", url: "https://www.acme.com" },
    text: "This article is sponsored by Acme.",
    label: "Sponsored by Acme",
    site_text: "This publication is sponsored by Acme.",
  };

  it("reads the flat sponsor_disclosure Letterstory ships, verbatim", () => {
    const post = normalizePost({ ...base, sponsor_disclosure: disclosure });
    expect(post?.sponsorDisclosure).toEqual({
      surfaces: disclosure.surfaces,
      sponsor: { name: "Acme", url: "https://www.acme.com" },
      text: "This article is sponsored by Acme.",
      label: "Sponsored by Acme",
      siteText: "This publication is sponsored by Acme.",
    });
  });

  // An app from before `label` serves the same words as `badge_text`.
  it("reads badge_text as the label when an older app serves no label", () => {
    const older: Record<string, unknown> = { ...disclosure, badge_text: "Sponsored by Acme" };
    delete older.label;
    const post = normalizePost({ ...base, sponsor_disclosure: older });
    expect(post?.sponsorDisclosure?.label).toBe("Sponsored by Acme");
    expect(post?.sponsorDisclosure?.surfaces).toEqual(disclosure.surfaces);
  });

  it("prefers label over badge_text when both are served", () => {
    const post = normalizePost({
      ...base,
      sponsor_disclosure: { ...disclosure, badge_text: "Old words" },
    });
    expect(post?.sponsorDisclosure?.label).toBe("Sponsored by Acme");
  });

  // The v1 payload: four surfaces, `text` + `badge_text`, nothing else.
  it("still reads a payload from before the new surfaces", () => {
    const post = normalizePost({
      ...base,
      sponsor_disclosure: {
        surfaces: ["article_footer", "cover_badge", "structured_data", "sponsored_links"],
        sponsor: { name: "Acme", url: "https://www.acme.com" },
        text: "This article is sponsored by Acme.",
        badge_text: "Sponsored by Acme",
      },
    });
    expect(post?.sponsorDisclosure).toEqual({
      surfaces: ["article_footer", "cover_badge", "structured_data", "sponsored_links"],
      sponsor: { name: "Acme", url: "https://www.acme.com" },
      text: "This article is sponsored by Acme.",
      label: "Sponsored by Acme",
      siteText: "",
    });
  });

  // Every payload from before the field existed must render exactly as it did.
  it("is null when absent or explicitly null", () => {
    expect(normalizePost(base)?.sponsorDisclosure).toBeNull();
    expect(normalizePost({ ...base, sponsor_disclosure: null })?.sponsorDisclosure).toBeNull();
  });

  it("keeps a null sponsor url, and drops one that isn't an http(s) URL", () => {
    const nullUrl = normalizePost({
      ...base,
      sponsor_disclosure: { ...disclosure, sponsor: { name: "Acme", url: null } },
    });
    expect(nullUrl?.sponsorDisclosure?.sponsor).toEqual({ name: "Acme", url: null });
    const badUrl = normalizePost({
      ...base,
      sponsor_disclosure: { ...disclosure, sponsor: { name: "Acme", url: "javascript:alert(1)" } },
    });
    expect(badUrl?.sponsorDisclosure?.sponsor.url).toBeNull();
  });

  it("drops unknown surfaces and duplicates, in canonical order", () => {
    const post = normalizePost({
      ...base,
      sponsor_disclosure: {
        ...disclosure,
        surfaces: ["site_statement", "structured_data", "masthead", "article_header", "structured_data", 7],
      },
    });
    expect(post?.sponsorDisclosure?.surfaces).toEqual(["article_header", "structured_data", "site_statement"]);
  });

  // A surface is dropped rather than worded here when its string is missing.
  it.each([
    ["label", { label: "  " }, ["article_header", "cover_badge", "meta_description"]],
    ["text", { text: "" }, ["article_footer"]],
    ["site_text", { site_text: null }, ["site_statement"]],
  ])("drops the surfaces that need %s when it is missing", (_, missing, dropped) => {
    const post = normalizePost({ ...base, sponsor_disclosure: { ...disclosure, ...missing } });
    expect(post?.sponsorDisclosure?.surfaces).toEqual(
      disclosure.surfaces.filter((s) => !dropped.includes(s)),
    );
  });

  // `site_byline` needs no words of its own.
  it("keeps site_byline with nothing but a sponsor", () => {
    const post = normalizePost({
      ...base,
      sponsor_disclosure: { surfaces: ["site_byline"], sponsor: { name: "Acme", url: null } },
    });
    expect(post?.sponsorDisclosure?.surfaces).toEqual(["site_byline"]);
  });

  // A payload served during the switch: the surface's old name, plus AI
  // strings the contract no longer has, which are ignored.
  it("reads ai_authorship as site_byline and drops ai_label / ai_text", () => {
    const post = normalizePost({
      ...base,
      sponsor_disclosure: {
        ...disclosure,
        surfaces: ["article_header", "ai_authorship", "site_byline"],
        ai_label: "Written with AI",
        ai_text: "This publication's articles are written with AI.",
      },
    });
    expect(post?.sponsorDisclosure).toEqual({
      surfaces: ["article_header", "site_byline"],
      sponsor: { name: "Acme", url: "https://www.acme.com" },
      text: "This article is sponsored by Acme.",
      label: "Sponsored by Acme",
      siteText: "This publication is sponsored by Acme.",
    });
  });

  // No invented persona: under site_byline (or its old name) no author field
  // is read, even one an older app (or anything upstream) still sends.
  it.each([["site_byline"], ["ai_authorship"]])("credits no author under %s, whatever the payload carries", (surface) => {
    const persona = {
      ...base,
      author: "Dana Reyes",
      author_name: "Dana Reyes",
      byline: "Dana Reyes",
      author_slug: "dana-reyes",
      author_profile: { name: "Dana Reyes", slug: "dana-reyes", bio: "Staff writer." },
      metadata: { author: "Dana Reyes" },
    };
    const site = normalizePost({ ...persona, sponsor_disclosure: { ...disclosure, surfaces: [surface] } });
    expect(site).toMatchObject({ author: null, authorSlug: null, authorProfile: null });
    const notAi = normalizePost({
      ...persona,
      sponsor_disclosure: { ...disclosure, surfaces: ["article_footer"] },
    });
    expect(notAi?.author).toBe("Dana Reyes");
  });

  it.each([
    ["a string", "Acme"],
    ["an array", [disclosure]],
    ["no surfaces", { ...disclosure, surfaces: [] }],
    ["only unknown surfaces", { ...disclosure, surfaces: ["masthead"] }],
    ["surfaces that isn't an array", { ...disclosure, surfaces: "article_footer" }],
    ["no sponsor", { ...disclosure, sponsor: null }],
    ["a blank sponsor name", { ...disclosure, sponsor: { name: " ", url: null } }],
    ["only a footer, with no text", { ...disclosure, surfaces: ["article_footer"], text: "" }],
    ["only a header, with no label", { ...disclosure, surfaces: ["article_header"], label: undefined }],
  ])("is null for a malformed disclosure: %s", (_, value) => {
    const post = normalizePost({ ...base, sponsor_disclosure: value });
    expect(post).not.toBeNull();
    expect(post?.sponsorDisclosure).toBeNull();
  });
});

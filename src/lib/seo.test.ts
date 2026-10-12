import { describe, it, expect } from "vitest";
import { articleLd, authorLd } from "./seo";
import { bylineFor, editorialByline } from "./author";
import { env } from "@/env";
import type { Post, SponsorDisclosure } from "./letterbrace/types";

const post = (extra: Partial<Post> = {}): Post => ({
  id: "1",
  slug: "post-1",
  title: "Post 1",
  content: "<p>x</p>",
  excerpt: "x",
  dek: null,
  status: "published",
  author: null,
  authorSlug: null,
  authorProfile: null,
  coverImage: null,
  coverImageAlt: null,
  coverCredit: null,
  tags: ["Technology"],
  createdAt: null,
  updatedAt: null,
  paperTrail: [],
  sponsorDisclosure: null,
  ...extra,
});

const orgId = `${env.siteUrl}/#organization`;

describe("articleLd author", () => {
  it("is a Person with the bank role and expertise", () => {
    const ld = articleLd(
      post({
        authorProfile: {
          name: "Ines Moreau",
          slug: "ines-moreau-7",
          bio: "Bio.",
          role: "Senior Writer",
          expertise: ["cloud"],
          startedAt: null,
        },
      }),
    );
    expect(ld.author).toMatchObject({
      "@type": "Person",
      name: "Ines Moreau",
      jobTitle: "Senior Writer",
      knowsAbout: ["cloud"],
      url: `${env.siteUrl}/authors/ines-moreau-7`,
      worksFor: { "@id": orgId },
    });
  });

  it("is the site Organization for the editorial byline, never a Person", () => {
    const ld = articleLd(post());
    expect(ld.author).toMatchObject({ "@type": "Organization", "@id": orgId });
  });
});

describe("authorLd", () => {
  it("makes the editorial page's main entity the site Organization", () => {
    const ld = authorLd(editorialByline(), [post()]);
    expect(ld.mainEntity).toMatchObject({ "@type": "Organization", "@id": orgId });
  });

  it("keeps a name-only Person, with no invented bio or job title", () => {
    const byline = bylineFor(post({ author: "Jane Doe" }));
    const ld = authorLd(byline, [post()]);
    expect(ld.mainEntity).toMatchObject({
      "@type": "Person",
      name: "Jane Doe",
    });
    expect(ld.mainEntity).not.toHaveProperty("description");
    expect(ld.mainEntity).not.toHaveProperty("jobTitle");
  });

  it("mirrors the bank bio and role when the author has them", () => {
    const byline = bylineFor(
      post({
        authorProfile: {
          name: "Ines Moreau",
          slug: "ines-moreau-7",
          bio: "Ines covers cloud.",
          role: "Senior Writer",
          expertise: [],
          startedAt: null,
        },
      }),
    );
    const ld = authorLd(byline, [post()]);
    expect(ld.mainEntity).toMatchObject({
      "@type": "Person",
      jobTitle: "Senior Writer",
      description: "Ines covers cloud.",
    });
  });
});

describe("articleLd sponsor", () => {
  const disclosure = (
    surfaces: SponsorDisclosure["surfaces"],
    url: string | null = "https://acme.com",
  ): SponsorDisclosure => ({
    surfaces,
    sponsor: { name: "Acme", url },
    text: "This article is sponsored by Acme.",
    badgeText: "Sponsored by Acme",
  });

  it("names the sponsor Organization when structured_data is listed", () => {
    const ld = articleLd(post({ sponsorDisclosure: disclosure(["article_footer", "structured_data"]) }));
    expect(ld.sponsor).toEqual({ "@type": "Organization", name: "Acme", url: "https://acme.com" });
  });

  it("omits the url when the sponsor has none", () => {
    const ld = articleLd(post({ sponsorDisclosure: disclosure(["structured_data"], null) }));
    expect(ld.sponsor).toEqual({ "@type": "Organization", name: "Acme" });
  });

  it("is absent when structured_data isn't listed, or nothing is disclosed", () => {
    expect(articleLd(post({ sponsorDisclosure: disclosure(["article_footer", "cover_badge"]) }))).not.toHaveProperty(
      "sponsor",
    );
    expect(articleLd(post())).not.toHaveProperty("sponsor");
  });
});

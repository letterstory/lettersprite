import { describe, it, expect } from "vitest";
import { articleLd, authorLd } from "./seo";
import { bylineFor, editorialByline } from "./author";
import { env } from "@/env";
import type { Post } from "./letterbrace/types";

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
  ...extra,
});

const orgId = `${env.siteUrl}/#organization`;

describe("articleLd author", () => {
  it("is a Person with the bank expertise and no job title", () => {
    const ld = articleLd(
      post({
        authorProfile: {
          name: "Ines Moreau",
          slug: "ines-moreau-7",
          expertise: ["cloud"],
          startedAt: null,
        },
      }),
    );
    expect(ld.author).toMatchObject({
      "@type": "Person",
      name: "Ines Moreau",
      knowsAbout: ["cloud"],
      url: `${env.siteUrl}/authors/ines-moreau-7`,
      worksFor: { "@id": orgId },
    });
    expect(ld.author).not.toHaveProperty("jobTitle");
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

  it("keeps a Person, with no bio or job title, for a real author", () => {
    const byline = bylineFor(post({ author: "Jane Doe" }));
    const ld = authorLd(byline, [post()]);
    expect(ld.mainEntity).toMatchObject({
      "@type": "Person",
      name: "Jane Doe",
    });
    expect(ld.mainEntity).not.toHaveProperty("description");
    expect(ld.mainEntity).not.toHaveProperty("jobTitle");
  });
});

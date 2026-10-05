import { describe, it, expect } from "vitest";
import {
  authorProfile,
  authorsFromPosts,
  bylineFor,
  editorialByline,
} from "./author";
import { env } from "@/env";
import type { Post, PostAuthorProfile } from "./letterbrace/types";

const post = (id: string, extra: Partial<Post> = {}): Post => ({
  id,
  slug: `post-${id}`,
  title: `Post ${id}`,
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

const bank: PostAuthorProfile = {
  name: "Ines Moreau",
  slug: "ines-moreau-7",
  bio: "Ines writes about infrastructure and the people who run it.",
  role: "Senior Writer",
  expertise: ["infrastructure", "cloud"],
  startedAt: "2021-03-15",
};

describe("bylineFor", () => {
  it("uses the bank profile's name, slug and role", () => {
    const b = bylineFor(
      post("1", { author: "Ines Moreau", authorSlug: "ines-moreau-7", authorProfile: bank }),
    );
    expect(b).toMatchObject({
      name: "Ines Moreau",
      slug: "ines-moreau-7",
      role: "Senior Writer",
      provided: true,
    });
    expect(b.profile).toBe(bank);
  });

  it("falls back to Staff Writer when the bank assigned no role", () => {
    const b = bylineFor(post("1", { authorProfile: { ...bank, role: null } }));
    expect(b.role).toBe("Staff Writer");
  });

  it("gives a free-form author Staff Writer, never a random role", () => {
    const roles = new Set(
      ["a", "b", "c", "d", "e", "f"].map(
        (id) => bylineFor(post(id, { author: `Writer ${id}` })).role,
      ),
    );
    expect([...roles]).toEqual(["Staff Writer"]);
    const b = bylineFor(post("1", { author: "Jane Doe" }));
    expect(b).toMatchObject({ name: "Jane Doe", slug: "jane-doe", provided: true });
  });

  it("keys a free-form author by the flat author_slug when present", () => {
    const b = bylineFor(post("1", { author: "Jane Doe", authorSlug: "jane-doe-2" }));
    expect(b.slug).toBe("jane-doe-2");
  });

  it("gives every unbylined post the same site-level editorial byline", () => {
    const a = bylineFor(post("1"));
    const b = bylineFor(post("2", { slug: "something-else", title: "Other" }));
    const c = bylineFor(post("3", { author: "undefined" }));
    expect(a).toEqual(b);
    expect(a).toEqual(c);
    expect(a).toEqual(editorialByline());
    expect(a).toMatchObject({
      name: `${env.siteTitle} Editors`,
      role: "Editorial team",
      provided: false,
      profile: null,
    });
  });
});

describe("authorProfile", () => {
  it("uses the bank bio verbatim and derives since from started_at", () => {
    const p = authorProfile(bylineFor(post("1", { authorProfile: bank })), ["Cloud"]);
    expect(p.bio).toBe(bank.bio);
    expect(p.since).toBe(2021);
    expect(p.location).toBeUndefined();
  });

  it("falls back to a coverage-only line when the bank bio is empty", () => {
    const p = authorProfile(
      bylineFor(post("1", { authorProfile: { ...bank, bio: "", startedAt: null } })),
      ["Cloud", "Security"],
    );
    expect(p.bio).toBe(`Ines Moreau covers cloud and security for ${env.siteTitle}.`);
    expect(p.since).toBeUndefined();
    expect(p.location).toBeUndefined();
  });

  it("never invents a city or tenure for a free-form author", () => {
    const p = authorProfile(bylineFor(post("1", { author: "Jane Doe" })), ["Design"]);
    expect(p.bio).toBe(`Jane Doe covers design for ${env.siteTitle}.`);
    expect(p.location).toBeUndefined();
    expect(p.since).toBeUndefined();
  });

  it("describes the editorial team for the fallback byline", () => {
    const p = authorProfile(editorialByline(), ["Technology", "Design"]);
    expect(p.bio).toMatch(/editorial team covers technology and design\.$/);
    expect(p.bio).toContain(env.siteTitle);
    expect(p.location).toBeUndefined();
    expect(p.since).toBeUndefined();
  });
});

describe("authorsFromPosts", () => {
  it("groups bank authors by slug and all unbylined posts onto one page", () => {
    const authors = authorsFromPosts([
      post("1", { authorProfile: bank }),
      post("2", { authorProfile: bank }),
      post("3"),
      post("4"),
      post("5"),
      post("6", { author: "Jane Doe" }),
    ]);
    expect(authors.map((a) => [a.slug, a.posts.length])).toEqual([
      [editorialByline().slug, 3],
      ["ines-moreau-7", 2],
      ["jane-doe", 1],
    ]);
  });

  it("keeps the bank record when only some of an author's posts carry it", () => {
    const [author] = authorsFromPosts([
      post("1", { author: "Ines Moreau", authorSlug: "ines-moreau-7" }),
      post("2", { authorProfile: bank }),
    ]);
    expect(author.posts).toHaveLength(2);
    expect(author.byline.profile).toBe(bank);
    expect(author.byline.role).toBe("Senior Writer");
  });
});

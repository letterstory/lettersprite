import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "@/env";
import { LAYOUTS } from "@/lib/layouts";
import { normalizePost } from "@/lib/letterbrace/normalize";
import type { Post } from "@/lib/letterbrace/types";
import { strippedClasses } from "./readability-patterns";

/**
 * Every article layout renders the sponsor disclosure. The doc this ships
 * against (letterstory docs/architecture/article-disclosure.md §5.2) names the
 * failure this guards: rendering only where `CoverCredit` appears would miss
 * most layouts, and a disclosure that shows on some themes is not a disclosure.
 *
 * Renders the real page functions — `/posts/[slug]` under every distinct
 * article treatment the active theme can select, and `StudioPostPage` (what
 * the redesign's three post routes render) in every layout — from a raw
 * payload through `normalizePost`, so the parse, the sanitizer, the JSON-LD and
 * the markup are all the shipped code. Only the content source and the
 * redesign's shell (whose async header needs the Next runtime) are stubbed.
 */

const content = vi.hoisted(() => ({ posts: [] as Post[] }));

vi.mock("@/lib/letterbrace/client", () => ({
  getPosts: async () => content.posts,
  getPostBySlug: async (slug: string) => content.posts.find((p) => p.slug === slug) ?? null,
}));

vi.mock("@/components/studio/StudioShell", () => ({
  StudioShell: ({ children }: { children: ReactNode }) => <div className="studio">{children}</div>,
}));

const { default: PostPage } = await import("@/app/posts/[slug]/page");
const { StudioPostPage } = await import("@/components/studio/pages");

const FOOTER = "This article is sponsored by Acme.";
const BADGE = "Sponsored by Acme";
/** The top-of-article line: `label`, verbatim, and nothing after it. */
const HEADER = BADGE;
/** Retired wording that must never render, whatever an older payload sends. */
const RETIRED = /written with ai/i;
/** The persona an older payload (or anything upstream) might still carry. */
const PERSONA = "Dana Reyes";

/** A body long enough to split for a mid-article moment, linking the sponsor. */
const BODY = [
  "<p>Opening paragraph about choosing tools, with enough words to read as a real lede.</p>",
  ...[1, 2, 3, 4].map(
    (n) =>
      `<h2>Section ${n}</h2><p>Paragraph ${n} cites <a href="https://docs.acme.com/guide">the Acme guide</a> and <a href="https://example.org/">an independent study</a>.</p>`,
  ),
].join("");

function payload(slug: string, sponsorDisclosure: unknown, extra: Record<string, unknown> = {}) {
  return {
    id: slug,
    slug,
    title: `Choosing tools ${slug}`,
    summary: "A dek.",
    content: BODY,
    cover_image: "https://cdn.example.com/cover.jpg",
    tags: ["Technology"],
    published_at: "2026-10-01T00:00:00Z",
    sponsor_disclosure: sponsorDisclosure,
    ...extra,
  };
}

/** Every surface, in the contract the app serves. */
const FULL = {
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
  text: FOOTER,
  label: BADGE,
  site_text: "This publication is sponsored by Acme.",
};

// The app serves the author fields null under site_byline; these carry a
// persona anyway, to prove none can reach the page.
const disclosed = normalizePost(
  payload("disclosed", FULL, {
    author: PERSONA,
    author_slug: "dana-reyes",
    author_profile: { name: PERSONA, slug: "dana-reyes", bio: "Dana covers tools.", role: "Staff Writer" },
  }),
)!;
const undisclosed = normalizePost(payload("undisclosed", null))!;
// No `published_at`: the page must show no date rather than invent one.
const undated = normalizePost({ ...payload("undated", null), published_at: undefined })!;

const count = (html: string, needle: string) => html.split(needle).length - 1;
const SPONSORED_REL = /rel="[^"]*\bsponsored\b/;

/** `/posts/[slug]`'s article treatments, one theme each, with a marker proving the branch rendered. */
const CLASSIC: { name: string; theme: string; marker: string }[] = [
  { name: "standard (sleek)", theme: "sleek", marker: 'aria-label="Breadcrumb"' },
  { name: "feature (atelier)", theme: "atelier", marker: "container-wide" },
  { name: "immersive full-bleed (folio)", theme: "folio", marker: "data-folio-hero" },
  { name: "immersive contained (kiosk)", theme: "kiosk", marker: "data-kiosk-hero" },
  { name: "vitrine", theme: "vitrine", marker: "-mt-24" },
  { name: "commons", theme: "commons", marker: "font-normal tracking-normal" },
  { name: "BlitzArticle (blitz)", theme: "blitz", marker: "Text by" },
  { name: "FluxArticle (flux)", theme: "flux", marker: "Most Popular" },
  { name: "FluxArticle (relay)", theme: "relay", marker: "Most Popular" },
  { name: "RiotArticle (riot)", theme: "riot", marker: "Most Read" },
];

const mutableEnv = env as { theme: string; redesign: boolean };

async function renderClassic(theme: string, post: Post): Promise<string> {
  mutableEnv.theme = theme;
  mutableEnv.redesign = false;
  const page = await PostPage({ params: Promise.resolve({ slug: post.slug }) });
  return renderToStaticMarkup(page);
}

async function renderStudio(layout: (typeof LAYOUTS)[number], post: Post): Promise<string> {
  const page = await StudioPostPage({ slug: post.slug, layout });
  if (!page) throw new Error(`no page for ${post.slug}`);
  return renderToStaticMarkup(page);
}

/** The top-of-article line, once, in classes Readability keeps. */
function expectHeaderLine(html: string) {
  const lines = [...html.matchAll(new RegExp(`<p class="([^"]*)" role="note">${HEADER}</p>`, "g"))];
  expect(lines).toHaveLength(1);
  expect(strippedClasses(`class="${lines[0][1]}"`)).toEqual([]);
  // At the top: before the body's first paragraph.
  expect(html.indexOf(HEADER)).toBeLessThan(html.indexOf("Opening paragraph"));
}

/** The byline is the site's own: no persona, no role, no profile, no retired wording. */
function expectSiteByline(html: string) {
  expect(html).not.toMatch(RETIRED);
  expect(html).not.toMatch(/Staff Writer|Editorial team/);
  expect(html).not.toContain(PERSONA);
  expect(html).toContain(`${env.siteTitle} Editors`);
  expect(html).not.toContain("View all"); // AuthorBio
  expect(html).not.toContain('class="s-author"'); // AuthorCard
  expect(html).not.toContain('href="/authors/'); // no author page to link to
  expect(html).toContain(`"author":{"@type":"Organization","@id":"${env.siteUrl}/#organization"`);
  expect(html).not.toContain('"@type":"Person"');
}

function expectDisclosed(html: string) {
  expectHeaderLine(html);
  expectSiteByline(html);
  expect(count(html, `>${FOOTER}</p>`)).toBe(1);
  expect(count(html, `>${BADGE}</span>`)).toBe(1);
  expect(html).toContain('"sponsor":{"@type":"Organization","name":"Acme","url":"https://www.acme.com"}');
  expect(html).toContain('href="https://docs.acme.com/guide" rel="noopener noreferrer nofollow sponsored"');
  expect(html).toContain('href="https://example.org/" rel="noopener noreferrer nofollow"');
}

function expectUndisclosed(html: string) {
  expect(html).not.toContain(FOOTER);
  expect(html).not.toContain(BADGE);
  expect(html).not.toContain("disclosure-lead");
  expect(html).not.toContain("cover-disclosure");
  expect(html).not.toContain("article-disclosure");
  expect(html).not.toContain('"sponsor":');
  expect(html).not.toMatch(SPONSORED_REL);
}

/** No dateline, no datetime, no datePublished — and no stray separator where one was. */
function expectUndated(html: string) {
  expect(html).not.toContain("datePublished");
  expect(html).not.toContain("dateTime=");
  expect(html).not.toMatch(/\b(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}/);
  expect(html).not.toMatch(/·\s*(<[^>]+>\s*)*·/);
}

beforeEach(() => {
  content.posts = [disclosed, undisclosed];
});

describe("sponsor disclosure renders in every article layout", () => {
  describe.each(CLASSIC)("/posts/[slug] — $name", ({ theme, marker }) => {
    it("shows the header line, the AI byline, the footer line, the badge, JSON-LD sponsor and rel=sponsored", async () => {
      const html = await renderClassic(theme, disclosed);
      expect(html).toContain(marker);
      expectDisclosed(html);
    });

    it("shows none of them when sponsor_disclosure is null", async () => {
      const html = await renderClassic(theme, undisclosed);
      expect(html).toContain(marker);
      expectUndisclosed(html);
    });

    it("renders an undated post with no date", async () => {
      content.posts = [undated];
      expectUndated(await renderClassic(theme, undated));
    });
  });

  describe.each(LAYOUTS.map((layout) => ({ layout })))("redesign — $layout", ({ layout }) => {
    it("shows the header line, the AI byline, the footer line, the badge, JSON-LD sponsor and rel=sponsored", async () => {
      expectDisclosed(await renderStudio(layout, disclosed));
    });

    it("shows none of them when sponsor_disclosure is null", async () => {
      expectUndisclosed(await renderStudio(layout, undisclosed));
    });

    it("renders an undated post with no date", async () => {
      content.posts = [undated];
      expectUndated(await renderStudio(layout, undated));
    });
  });

  // A payload served during the switch: the surface's old name, with the AI
  // strings the contract no longer has. The byline is still the site's own,
  // and the retired words never render.
  it("reads ai_authorship as site_byline and renders none of its retired wording", async () => {
    const switching = normalizePost(
      payload(
        "switching",
        {
          ...FULL,
          surfaces: ["article_header", "ai_authorship"],
          ai_label: "Written with AI",
          ai_text: "This publication's articles are written with AI.",
        },
        { author: PERSONA },
      ),
    )!;
    content.posts = [switching];
    for (const html of [await renderClassic("sleek", switching), await renderStudio("notes", switching)]) {
      expectHeaderLine(html);
      expectSiteByline(html);
    }
  });

  it("renders only the surfaces listed", async () => {
    const footerOnly = normalizePost(
      payload("footer-only", {
        surfaces: ["article_footer"],
        sponsor: { name: "Acme", url: "https://acme.com" },
        text: FOOTER,
        label: BADGE,
      }),
    )!;
    content.posts = [footerOnly];
    for (const html of [await renderClassic("sleek", footerOnly), await renderStudio("notes", footerOnly)]) {
      expect(count(html, FOOTER)).toBe(1);
      expect(html).not.toContain(BADGE);
      expect(html).not.toContain('"sponsor":');
      expect(html).not.toMatch(SPONSORED_REL);
    }
  });

  // A new layout must join the lists above, or this fails: the cases are the
  // claim "every layout", so they can't silently fall behind the code.
  it("covers every article layout in the codebase", () => {
    const dir = (p: string) => readdirSync(join(process.cwd(), p));
    const classic = dir("src/components/article").filter((f) => f.endsWith("Article.tsx"));
    const covered = new Set(CLASSIC.map((c) => /^(\w+Article)\b/.exec(c.name)?.[1]).filter(Boolean));
    expect(classic.map((f) => f.replace(".tsx", "")).sort()).toEqual([...covered].sort());
    const studio = dir("src/components/studio/layouts").filter((f) => f.endsWith("Article.tsx"));
    expect(studio.map((f) => f.replace("Article.tsx", "").toLowerCase()).sort()).toEqual([...LAYOUTS].sort());
  });
});

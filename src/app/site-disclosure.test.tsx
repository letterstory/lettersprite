import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "@/env";
import { getBrand } from "@/lib/brand";
import { normalizePost } from "@/lib/letterbrace/normalize";
import type { Post } from "@/lib/letterbrace/types";

/**
 * The site-level surfaces: a site with no site-level API reads its disclosure
 * off its posts (`siteDisclosure`), and every place a reader or an agent meets
 * the publication says it — the same words for both, verbatim. Rendered from a
 * raw payload through `normalizePost`; only the content source is stubbed.
 */

const content = vi.hoisted(() => ({ posts: [] as Post[] }));

vi.mock("@/lib/letterbrace/client", () => ({
  getPosts: async () => content.posts,
  getPostBySlug: async (slug: string) => content.posts.find((p) => p.slug === slug) ?? null,
}));

const { GET: llms } = await import("@/app/llms.txt/route");
const { GET: feed } = await import("@/app/feed.xml/route");
const { default: AboutPage } = await import("@/app/about/page");
const { generateMetadata: siteMetadata } = await import("@/app/layout");
const { generateMetadata: postMetadata } = await import("@/app/posts/[slug]/page");
const { generateMetadata: previewMetadata } = await import("@/app/new/posts/[slug]/page");
const { SiteFooter } = await import("@/components/SiteFooter");
const { StudioFooter } = await import("@/components/studio/StudioFooter");

const SITE_TEXT = "This publication is sponsored by Acme.";
const LABEL = "Sponsored by Acme";

const disclosed = normalizePost({
  id: "d",
  slug: "disclosed",
  title: "Choosing tools",
  summary: "How to choose tools.",
  content: "<p>Body.</p>",
  published_at: "2026-10-01T00:00:00Z",
  sponsor_disclosure: {
    surfaces: ["article_header", "meta_description", "site_statement", "site_byline"],
    sponsor: { name: "Acme", url: "https://acme.com" },
    text: "This article is sponsored by Acme.",
    label: LABEL,
    site_text: SITE_TEXT,
  },
})!;
const plain = normalizePost({
  id: "p",
  slug: "plain",
  title: "An older piece",
  summary: "An older summary.",
  content: "<p>Body.</p>",
  author: "Jane Doe",
  published_at: "2026-09-01T00:00:00Z",
})!;

const text = async (res: Response) => res.text();
/** Retired wording that must never render, whatever an older payload sends. */
const RETIRED = /written with ai/i;

beforeEach(() => {
  content.posts = [disclosed, plain];
});

describe("a disclosed site says so everywhere", () => {
  it("states it in the footer of every page, in both designs", async () => {
    for (const footer of [await SiteFooter(), await StudioFooter({ brand: getBrand() })]) {
      const markup = renderToStaticMarkup(footer);
      expect(markup).toContain(`>${SITE_TEXT}</p>`);
      expect(markup).not.toMatch(RETIRED);
    }
  });

  it("gives the About page an ownership section, and no contributor list under site_byline", async () => {
    const page = renderToStaticMarkup(await AboutPage());
    expect(page).toContain("Ownership and funding");
    expect(page).toContain(`>${SITE_TEXT}</p>`);
    expect(page).toContain('href="https://acme.com"');
    expect(page).not.toContain("How this is written");
    expect(page).not.toMatch(RETIRED);
    expect(page).not.toContain("Contributors");
    expect(page).not.toContain("Jane Doe");
  });

  it("opens llms.txt with an About this publication block", async () => {
    const body = await text(await llms());
    const about = body.indexOf("## About this publication");
    expect(about).toBeGreaterThan(body.indexOf(`# ${env.siteTitle}`));
    expect(about).toBeLessThan(body.indexOf("## Posts"));
    // The sentence verbatim, then where to find the sponsor — named once in the sentence.
    expect(body).toContain(`## About this publication\n\n${SITE_TEXT}\n\nSponsor: [Acme](https://acme.com)\n\n## Posts`);
    expect(body).not.toMatch(RETIRED);
  });

  it("leads the RSS channel with the statement and each disclosed item with its label", async () => {
    const xml = await text(await feed());
    const about = env.siteDescription || env.siteTitle;
    expect(xml).toContain(`<description>${SITE_TEXT} ${about}</description>`);
    expect(xml).not.toMatch(RETIRED);
    expect(xml).toContain(`<description>${LABEL}. How to choose tools.</description>`);
    expect(xml).toContain("<description>An older summary.</description>");
    // The site-byline item is credited to the site, the other to its author.
    expect(xml).toContain(`<dc:creator>${env.siteTitle} Editors</dc:creator>`);
    expect(xml).toContain("<dc:creator>Jane Doe</dc:creator>");
  });

  it("leads the site description with the statement", async () => {
    const meta = await siteMetadata();
    const lead = env.siteDescription ? `${SITE_TEXT} ${env.siteDescription}` : SITE_TEXT;
    expect(meta.description).toBe(lead);
    expect(meta.openGraph?.description).toBe(lead);
    expect(meta.twitter?.description).toBe(lead);
  });

  it("leads a disclosed post's descriptions with its label, and leaves the title alone", async () => {
    for (const generate of [postMetadata, previewMetadata]) {
      const meta = await generate({ params: Promise.resolve({ slug: "disclosed" }) });
      expect(meta.title).toBe("Choosing tools");
      expect(meta.description).toBe(`${LABEL}. How to choose tools.`);
      expect(meta.openGraph?.description).toBe(`${LABEL}. How to choose tools.`);
      expect(meta.twitter?.description).toBe(`${LABEL}. How to choose tools.`);
    }
    const plainMeta = await postMetadata({ params: Promise.resolve({ slug: "plain" }) });
    expect(plainMeta.description).toBe("An older summary.");
  });
});

describe("an undisclosed site says nothing it does not mean", () => {
  beforeEach(() => {
    content.posts = [plain];
  });

  it("adds nothing to the footers, About, llms.txt, RSS or the site description", async () => {
    expect(renderToStaticMarkup(await SiteFooter())).not.toContain("publication-disclosure");
    expect(renderToStaticMarkup(await StudioFooter({ brand: getBrand() }))).not.toContain("publication-disclosure");
    const about = renderToStaticMarkup(await AboutPage());
    expect(about).not.toContain("Ownership and funding");
    expect(about).toContain("Contributors");
    expect(await text(await llms())).not.toContain("About this publication");
    expect(await text(await feed())).toContain(
      `<description>${env.siteDescription || env.siteTitle}</description>`,
    );
    expect((await siteMetadata()).description).toBe(env.siteDescription || undefined);
  });
});

// Every site, disclosed or not: the sign-up claims no audience or cadence.
describe("the newsletter sign-up", () => {
  it("makes no audience claim", async () => {
    const { NewsletterCTA } = await import("@/components/NewsletterCTA");
    const mutableEnv = env as { newsletterEnabled: boolean };
    const was = mutableEnv.newsletterEnabled;
    mutableEnv.newsletterEnabled = true;
    try {
      for (const variant of ["band", "inline"] as const) {
        const page = renderToStaticMarkup(<NewsletterCTA variant={variant} />);
        expect(page).toContain("Get new articles by email.");
        expect(page).not.toMatch(/thousands|readers|every week/i);
      }
    } finally {
      mutableEnv.newsletterEnabled = was;
    }
  });
});

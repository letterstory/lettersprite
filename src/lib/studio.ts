import { env } from "@/env";
import { isLayout, type StudioLayout } from "@/lib/layouts";

export type { StudioLayout };
import { authorProfile, authorsFromPosts, bylineFor, type AuthorProfile, type Byline } from "@/lib/author";
import { postsInSection, readingTimeMinutes, sectionFor, sectionHref, topSections, wordCount } from "@/lib/editorial";
import { getPostBySlug, getPosts } from "@/lib/letterbrace/client";
import type { Post } from "@/lib/letterbrace/types";
import { relatedPosts } from "@/lib/related";
import { sanitizePostHtml } from "@/lib/sanitize";
import { buildToc, type Heading } from "@/lib/toc";

/**
 * Data for the /new redesign, shaped once and shared by every layout. A layout
 * decides how a page looks; it never decides what is true about the content.
 */

export function getLayout(): StudioLayout {
  return isLayout(env.layout) ? env.layout : "notes";
}

/**
 * Where the redesign lives: at the site's normal URLs when it is the site's
 * design (SITE_REDESIGN), else under /new beside the current one (demo builds).
 */
export function studioBase(): string {
  return env.redesign && !env.designCompare ? "" : "/new";
}

/** The redesign's home page. */
export function studioHome(): string {
  return studioBase() || "/";
}

export function studioHref(post: Post): string {
  return `${studioBase()}/posts/${post.slug}`;
}

/** A topic: its real section page when live, a filtered home on /new. */
export function topicHref(topic: string): string {
  return studioBase() ? `/new?topic=${encodeURIComponent(topic)}` : sectionHref(topic);
}

export interface StudioHomeData {
  posts: Post[];
  sections: string[];
  /** Real totals for a proof banner — counted, never estimated. */
  stats: { posts: number; sources: number; topics: number; minutes: number; authors: number };
}

/** The home's data — or one section's, for a section page in the redesign. */
export async function loadHome(sectionSlug?: string): Promise<StudioHomeData> {
  const all = await getPosts();
  const posts = sectionSlug ? postsInSection(all, sectionSlug) : all;
  const sections = topSections(posts, 8);
  return {
    posts,
    sections,
    stats: {
      posts: posts.length,
      sources: posts.reduce((n, p) => n + p.paperTrail.length, 0),
      topics: new Set(posts.map((p) => sectionFor(p))).size,
      minutes: posts.reduce((n, p) => n + readingTimeMinutes(p), 0),
      authors: new Set(posts.map((p) => bylineFor(p).name)).size,
    },
  };
}

export interface StudioArticleData {
  post: Post;
  html: string;
  headings: Heading[];
  /** The body split before its middle section, for a mid-article moment. */
  before: string;
  after: string;
  byline: Byline;
  profile: AuthorProfile;
  related: Post[];
  words: number;
}

/**
 * Split the body before the h2 nearest its midpoint, so a call-to-action or
 * pull quote can sit between two sections instead of interrupting a paragraph.
 */
function splitAtMiddleSection(html: string): { before: string; after: string } {
  const starts = [...html.matchAll(/<h2\b/gi)].map((m) => m.index ?? 0).filter((i) => i > 0);
  if (starts.length < 3) return { before: html, after: "" };
  const mid = html.length * 0.5;
  const at = starts.reduce((best, i) => (Math.abs(i - mid) < Math.abs(best - mid) ? i : best));
  return { before: html.slice(0, at), after: html.slice(at) };
}

export async function loadArticle(slug: string): Promise<StudioArticleData | null> {
  const post = await getPostBySlug(slug);
  if (!post) return null;
  const all = await getPosts();
  const byline = bylineFor(post);
  const authorPosts = authorsFromPosts(all).find((a) => a.slug === byline.slug)?.posts ?? [post];
  const beats = [...new Set(authorPosts.map((p) => sectionFor(p).toLowerCase()))];
  const { html, headings } = buildToc(sanitizePostHtml(post.content));
  return {
    post,
    html,
    headings,
    ...splitAtMiddleSection(html),
    byline,
    profile: authorProfile(byline, beats),
    related: relatedPosts(post, all, 3),
    words: wordCount(post),
  };
}

/**
 * The first substantial sentence of the body that reads well on its own, for a
 * pull quote: real text from the article, never written for it.
 */
export function pullQuote(html: string): string | null {
  const paras = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
    .slice(2);
  for (const p of paras) {
    // Whole sentences only: split at sentence ends, keep one that starts with
    // a capital and stands alone at pull-quote length.
    for (const sentence of p.split(/(?<=[.!?])\s+(?=[A-Z])/)) {
      const t = sentence.trim();
      if (t.length >= 60 && t.length <= 170 && /^[A-Z]/.test(t) && /[.!?]$/.test(t) && !/["“”:;]/.test(t)) {
        return t;
      }
    }
  }
  return null;
}

/**
 * Wrap each body image in a numbered figure, captioned from its own alt text
 * (first sentence, minus a leading "Diagram:"-style label). Real text only; an
 * image without alt text is numbered but not captioned.
 */
export function numberFigures(html: string): string {
  let n = 0;
  return html.replace(/<img\b[^>]*>/gi, (img) => {
    n += 1;
    const alt = /\balt\s*=\s*"([^"]*)"/i.exec(img)?.[1] ?? "";
    const text = alt
      .replace(/^(diagram|chart|figure|image|illustration)\s*:\s*/i, "")
      .split(/(?<=\.)\s/)[0]
      .replace(/\.\s*$/, "");
    const caption = text ? ` ${text}.` : "";
    return `<figure class="c-fig">${img}<figcaption><b>Figure ${n}.</b>${caption}</figcaption></figure>`;
  });
}

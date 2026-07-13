/**
 * Structured data (JSON-LD) builders.
 *
 * These make the blog legible to search engines and aggregators as a real
 * publication: an Organization + WebSite graph emitted once site-wide, and a
 * BlogPosting + BreadcrumbList per article. Everything is derived from the same
 * data the page renders, so structured data always matches visible content.
 *
 * Rules enforced here (see the SEO notes in the repo history):
 *  - all URLs and image URLs are ABSOLUTE;
 *  - `author` is always a Person/Organization object, never a bare string;
 *  - nodes reference each other by `@id` instead of duplicating;
 *  - null/undefined keys are stripped before serialization.
 */

import { env } from "@/env";
import { pickFavicon } from "./favicon";
import { authorProfile, bylineFor, type Byline } from "./author";
import { modifiedDate, publishDate, sectionFor } from "./editorial";
import { absoluteCover, absoluteUrl, postUrl } from "./url";
import type { Post } from "./letterbrace/types";

type Json = Record<string, unknown>;

const ORG_ID = `${env.siteUrl}/#organization`;
const SITE_ID = `${env.siteUrl}/#website`;

/** Drop null/undefined values so we never emit empty structured-data keys. */
function clean<T extends Json>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null),
  ) as T;
}

/** Google truncates headlines past ~110 chars from the Article rich result. */
function headline(title: string): string {
  return title.length <= 110 ? title : `${title.slice(0, 107).trimEnd()}…`;
}

/**
 * The site-wide Organization + WebSite graph. Emitted once, in the root layout.
 * No SearchAction: this is a static, search-less blog, and a target that 404s
 * is worse than none.
 */
export function siteGraphLd(): Json {
  const favicon = pickFavicon();
  const org: Json = clean({
    "@type": "Organization",
    "@id": ORG_ID,
    name: env.siteTitle,
    url: env.siteUrl,
    description: env.siteDescription || undefined,
    logo: favicon ? absoluteUrl(favicon.url) : undefined,
  });
  const website: Json = clean({
    "@type": "WebSite",
    "@id": SITE_ID,
    url: env.siteUrl,
    name: env.siteTitle,
    description: env.siteDescription || undefined,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  });
  return { "@context": "https://schema.org", "@graph": [org, website] };
}

/** The author node for an article: a Person matching the visible byline. */
function authorNode(post: Post): Json {
  const byline = bylineFor(post);
  return clean({
    "@type": "Person",
    name: byline.name,
    jobTitle: byline.role,
    worksFor: { "@id": ORG_ID },
  });
}

/** BlogPosting for a single article. */
export function articleLd(post: Post): Json {
  const url = postUrl(post);
  return clean({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}/#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: headline(post.title),
    description: post.excerpt || undefined,
    image: [absoluteCover(post)],
    datePublished: publishDate(post),
    dateModified: modifiedDate(post),
    author: authorNode(post),
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": SITE_ID },
    articleSection: sectionFor(post),
    keywords: post.tags.length ? post.tags.join(", ") : undefined,
    inLanguage: "en",
  });
}

/**
 * Breadcrumbs for an article. Home → article. The section is shown as a kicker
 * but has no dedicated route, so it's intentionally not linked as a crumb (a
 * BreadcrumbList item that 404s is a validation strike).
 */
export function breadcrumbLd(post: Post): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: env.siteUrl },
      { "@type": "ListItem", position: 2, name: post.title },
    ],
  };
}

/**
 * A ProfilePage for an author's `/authors/[slug]` page: the Person plus an
 * ItemList of their stories, so the byline reads as a real staff page to search
 * engines. Mirrors the visible bio and the article-level `authorNode`.
 */
export function authorLd(byline: Byline, posts: Post[], beats: string[]): Json {
  const url = `${env.siteUrl}/authors/${byline.slug}`;
  const { bio } = authorProfile(byline, beats);
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${url}/#profile`,
    url,
    isPartOf: { "@id": SITE_ID },
    mainEntity: clean({
      "@type": "Person",
      "@id": `${url}/#person`,
      name: byline.name,
      jobTitle: byline.role,
      description: bio,
      url,
      worksFor: { "@id": ORG_ID },
    }),
    hasPart: posts.slice(0, 20).map((p) => ({
      "@type": "BlogPosting",
      "@id": `${postUrl(p)}/#article`,
      url: postUrl(p),
      headline: headline(p.title),
      datePublished: publishDate(p),
    })),
  };
}

/** A lightweight Blog + ItemList for the homepage, to frame it as a hub. */
export function blogListingLd(posts: Post[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${env.siteUrl}/#blog`,
    url: env.siteUrl,
    name: env.siteTitle,
    description: env.siteDescription || undefined,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
    blogPost: posts.slice(0, 20).map((p) => ({
      "@type": "BlogPosting",
      "@id": `${postUrl(p)}/#article`,
      url: postUrl(p),
      headline: headline(p.title),
      datePublished: publishDate(p),
    })),
  };
}

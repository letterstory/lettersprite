import { env } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import { bylineFor } from "@/lib/author";
import { discloses, prefixed, siteDisclosure, siteStatement } from "@/lib/disclosure";
import { publishDate, sectionFor } from "@/lib/editorial";
import type { Post } from "@/lib/letterbrace/types";
import { postUrl } from "@/lib/url";

// Bake the feed at build time like the rest of the site.
export const dynamic = "force-static";

/** Escape the five XML-significant characters. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * An item's description: its excerpt, led by its own disclosure `label` when
 * that disclosure lists `meta_description` or `site_statement` — a feed reader
 * shows the item without the page around it.
 */
function itemDescription(p: Post): string {
  const d = p.sponsorDisclosure;
  const listed = discloses(d, "meta_description") || discloses(d, "site_statement");
  return listed && d?.label ? prefixed(d.label, p.excerpt) : p.excerpt;
}

export async function GET(): Promise<Response> {
  const posts = await getPosts();
  // The site statement leads the channel description, verbatim.
  const statement = siteStatement(siteDisclosure(posts));
  const about = env.siteDescription || env.siteTitle;
  const channelDescription = statement ? `${statement} ${about}` : about;

  const items = posts
    .map((p) => {
      const link = postUrl(p);
      // RSS 2.0 requires RFC-822 dates — Date.toUTCString(), never ISO. An
      // undated post has no <pubDate> (it is optional) rather than an invented one.
      const published = publishDate(p);
      const pubDate = published
        ? `\n      <pubDate>${new Date(published).toUTCString()}</pubDate>`
        : "";
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      <description>${esc(itemDescription(p))}</description>
      <dc:creator>${esc(bylineFor(p).name)}</dc:creator>
      <category>${esc(sectionFor(p))}</category>${pubDate}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(env.siteTitle)}</title>
    <link>${esc(env.siteUrl)}</link>
    <description>${esc(channelDescription)}</description>
    <language>en</language>
    <atom:link href="${esc(env.siteUrl)}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

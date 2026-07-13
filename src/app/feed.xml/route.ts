import { env } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import { bylineFor } from "@/lib/author";
import { publishDate, sectionFor } from "@/lib/editorial";
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

export async function GET(): Promise<Response> {
  const posts = await getPosts();

  const items = posts
    .map((p) => {
      const link = postUrl(p);
      // RSS 2.0 requires RFC-822 dates — Date.toUTCString(), never ISO.
      const pubDate = new Date(publishDate(p)).toUTCString();
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      <description>${esc(p.excerpt)}</description>
      <dc:creator>${esc(bylineFor(p).name)}</dc:creator>
      <category>${esc(sectionFor(p))}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(env.siteTitle)}</title>
    <link>${esc(env.siteUrl)}</link>
    <description>${esc(env.siteDescription || env.siteTitle)}</description>
    <language>en</language>
    <atom:link href="${esc(env.siteUrl)}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

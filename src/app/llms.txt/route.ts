import { env } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import { siteDisclosure } from "@/lib/disclosure";
import type { SponsorDisclosure } from "@/lib/letterbrace/types";
import { postUrl } from "@/lib/url";

// Bake the file at build time like the sitemap and RSS feed.
export const dynamic = "force-static";

/** Collapse any whitespace (incl. newlines) so each entry stays on one line. */
function oneLine(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Letter's site statement, verbatim, then the sponsor's site as a link
 * when it has one — the sentence already names the sponsor, so the link line
 * adds only where to find them.
 */
function aboutBlock(d: SponsorDisclosure | null): string[] {
  if (!d) return [];
  return [
    "## About this publication",
    "",
    oneLine(d.siteText),
    "",
    ...(d.sponsor.url ? [`Sponsor: [${oneLine(d.sponsor.name)}](${d.sponsor.url})`, ""] : []),
  ];
}

/**
 * `/llms.txt` — the llms.txt convention (https://llmstxt.org): a plain-text,
 * markdown-shaped index for AI crawlers. Title, one-line summary, then every
 * published post as a link + excerpt, all from the same build-time fetch the
 * sitemap and feed use. When the site discloses (`site_statement`), an "About
 * this publication" block follows the summary, before any post: it is the
 * first thing an agent reading the site learns.
 */
export async function GET(): Promise<Response> {
  const posts = await getPosts();

  const items = posts
    .map((p) => `- [${oneLine(p.title)}](${postUrl(p)}): ${oneLine(p.excerpt)}`)
    .join("\n");

  const lines = [
    `# ${env.siteTitle}`,
    "",
    // The blockquote summary is optional in the convention; skip it rather
    // than emit an empty "> " when a deployment has no description.
    ...(env.siteDescription ? [`> ${oneLine(env.siteDescription)}`, ""] : []),
    ...aboutBlock(siteDisclosure(posts)),
    "## Posts",
    "",
    items,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

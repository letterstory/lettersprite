import { env } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import { postUrl } from "@/lib/url";

// Bake the file at build time like the sitemap and RSS feed.
export const dynamic = "force-static";

/** Collapse any whitespace (incl. newlines) so each entry stays on one line. */
function oneLine(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/**
 * `/llms.txt` — the llms.txt convention (https://llmstxt.org): a plain-text,
 * markdown-shaped index for AI crawlers. Title, one-line summary, then every
 * published post as a link + excerpt, all from the same build-time fetch the
 * sitemap and feed use.
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
    "## Posts",
    "",
    items,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

import type { MetadataRoute } from "next";
import { env } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import { allSections, publishDate, sectionSlug, postsInSection } from "@/lib/editorial";
import { authorsFromPosts } from "@/lib/author";
import { absoluteCover } from "@/lib/url";
import type { Post } from "@/lib/letterbrace/types";

export const dynamic = "force-static";

/** Newest publish date across a set of posts (ISO), or undefined when empty. */
function latestPublish(posts: Post[]): string | undefined {
  return posts.map((p) => publishDate(p)).sort((a, b) => b.localeCompare(a))[0] ?? undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  const latest = latestPublish(posts);

  // Each post advertises its OWN publish date as <lastmod>. Deliberately NOT
  // post.updatedAt: the content API's updated timestamp is restamped whenever a
  // post is re-pinned or the fleet is redeployed, so it collapsed every URL onto
  // one build-day instant — the "the entire site changed today" signal that Google
  // reads as churn and that made this sitemap unhealthy. publishDate is the
  // set-once publish date: spread across the real timeline, stable across rebuilds,
  // and consistent with the page's datePublished.
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${env.siteUrl}/posts/${post.slug}`,
    lastModified: publishDate(post),
    changeFrequency: "monthly",
    priority: 0.7,
    images: [absoluteCover(post)],
  }));

  // One entry per section SLUG. Several tag spellings can collapse to the same
  // slug (e.g. "MCP Security" and "MCP security" both -> mcp-security), which used
  // to emit duplicate <url>s for the same page; keying by slug dedupes them. Each
  // section's lastmod is its own newest post, not the site-wide latest.
  const seenSection = new Set<string>();
  const sectionEntries: MetadataRoute.Sitemap = [];
  for (const name of allSections(posts)) {
    const slug = sectionSlug(name);
    if (!slug || seenSection.has(slug)) continue;
    seenSection.add(slug);
    sectionEntries.push({
      url: `${env.siteUrl}/sections/${slug}`,
      lastModified: latestPublish(postsInSection(posts, slug)) ?? latest,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  const authorEntries: MetadataRoute.Sitemap = authorsFromPosts(posts).map((a) => ({
    url: `${env.siteUrl}/authors/${a.slug}`,
    lastModified: latest,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [
    {
      url: env.siteUrl,
      lastModified: latest,
      changeFrequency: "daily",
      priority: 1,
    },
    ...sectionEntries,
    ...authorEntries,
    ...postEntries,
  ];
}

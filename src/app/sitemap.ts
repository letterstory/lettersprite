import type { MetadataRoute } from "next";
import { env } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import { allSections, publishDate, sectionSlug } from "@/lib/editorial";
import { authorsFromPosts } from "@/lib/author";
import { absoluteCover } from "@/lib/url";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  const latest =
    posts
      .map((p) => publishDate(p))
      .sort((a, b) => b.localeCompare(a))[0] ?? undefined;

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${env.siteUrl}/posts/${post.slug}`,
    lastModified: post.updatedAt ?? publishDate(post),
    changeFrequency: "monthly",
    priority: 0.7,
    images: [absoluteCover(post)],
  }));

  const sectionEntries: MetadataRoute.Sitemap = allSections(posts).map((s) => ({
    url: `${env.siteUrl}/sections/${sectionSlug(s)}`,
    lastModified: latest,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

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

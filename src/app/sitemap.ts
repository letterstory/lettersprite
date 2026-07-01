import type { MetadataRoute } from "next";
import { env } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${env.siteUrl}/posts/${post.slug}`,
    lastModified: post.updatedAt ?? post.createdAt ?? undefined,
  }));

  return [{ url: env.siteUrl }, ...postEntries];
}

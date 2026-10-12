import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getPosts } from "@/lib/letterbrace/client";
import { env } from "@/env";
import { getLayout } from "@/lib/studio";
import { disclosedDescription } from "@/lib/disclosure";
import { StudioPostPage } from "@/components/studio/pages";

type Params = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  // /new is the side-by-side preview: demo builds only.
  if (!env.designCompare) return [];
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  // Led by the disclosure label when it lists `meta_description`, the same as
  // the live post, so a link preview of the preview says it too.
  const description = disclosedDescription(post.sponsorDisclosure, post.excerpt);
  return {
    title: post.title,
    description,
    openGraph: { type: "article", title: post.title, description, siteName: env.siteTitle },
    twitter: { card: "summary_large_image", title: post.title, description },
    // A preview of the live post: never compete with it in search.
    alternates: { canonical: `/posts/${post.slug}` },
    robots: { index: false, follow: true },
  };
}

export default async function StudioPost({ params }: Params) {
  const { slug } = await params;
  const page = await StudioPostPage({ slug, layout: getLayout() });
  if (!page) notFound();
  return page;
}

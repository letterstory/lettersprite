import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getPosts } from "@/lib/letterbrace/client";
import { getLayout } from "@/lib/studio";
import { StudioPostPage } from "@/components/studio/pages";

type Params = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt || undefined,
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

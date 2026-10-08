import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { env } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import { LAYOUTS, isLayout } from "@/lib/layouts";
import { StudioPostPage } from "@/components/studio/pages";

type Params = { params: Promise<{ layout: string; slug: string }> };

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  if (!env.designCompare) return [];
  const posts = await getPosts();
  return LAYOUTS.flatMap((layout) => posts.map((p) => ({ layout, slug: p.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  return { alternates: { canonical: `/posts/${slug}` }, robots: { index: false, follow: false } };
}

export default async function StyledPost({ params }: Params) {
  const { layout, slug } = await params;
  if (!isLayout(layout)) notFound();
  const page = await StudioPostPage({ slug, layout });
  if (!page) notFound();
  return page;
}

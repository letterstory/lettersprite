import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { env } from "@/env";
import { getPostBySlug, getPosts } from "@/lib/letterbrace/client";
import { PostContent } from "@/components/PostContent";
import { PostMeta } from "@/components/PostMeta";

type Params = { params: Promise<{ slug: string }> };

// Fully static: only posts that existed at build time are generated; any other
// slug 404s rather than rendering on-demand (which would hit the API).
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

  const description = post.excerpt || undefined;
  const url = `${env.siteUrl}/posts/${post.slug}`;
  const images = post.coverImage ? [post.coverImage] : undefined;
  return {
    title: post.title,
    description,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url,
      publishedTime: post.createdAt ?? undefined,
      modifiedTime: post.updatedAt ?? undefined,
      images,
    },
    twitter: { card: "summary_large_image", title: post.title, description, images },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="container-content px-6 py-12">
      <Link
        href="/"
        className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
          ←
        </span>
        All posts
      </Link>

      <header className="mb-10 mt-6">
        {post.tags[0] && (
          <span className="text-[0.7rem] font-semibold uppercase tracking-widest text-primary">
            {post.tags[0]}
          </span>
        )}
        <h1 className="mt-3 font-heading text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        <PostMeta post={post} className="mt-5 text-sm" />
      </header>

      {post.coverImage && (
        <img
          src={post.coverImage}
          alt=""
          className="mb-10 w-full rounded-[var(--radius)] object-cover"
        />
      )}

      <PostContent html={post.content} />
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { env } from "@/env";
import { getPostBySlug, getPosts } from "@/lib/letterbrace/client";
import { coverImageFor } from "@/lib/covers";
import { bylineFor } from "@/lib/author";
import {
  modifiedDate,
  publishDate,
  readingTimeLabel,
  sectionFor,
  sectionHref,
} from "@/lib/editorial";
import { relatedPosts } from "@/lib/related";
import { articleLd, breadcrumbLd } from "@/lib/seo";
import { postUrl } from "@/lib/url";
import { formatDate } from "@/lib/format";
import { getActiveTheme } from "@/themes";
import { JsonLd } from "@/components/JsonLd";
import { Kicker } from "@/components/Kicker";
import { NewsletterCTA } from "@/components/NewsletterCTA";
import { PostContent } from "@/components/PostContent";
import { PostMeta } from "@/components/PostMeta";
import { RelatedPosts } from "@/components/RelatedPosts";
import { ShareRow } from "@/components/ShareRow";

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
  const url = postUrl(post);
  const byline = bylineFor(post);
  const published = publishDate(post);
  // Cover resolves against metadataBase (OG allows relative here).
  const image = {
    url: coverImageFor(post),
    width: 1200,
    height: 675,
    alt: post.title,
  };
  return {
    title: post.title,
    description,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url,
      siteName: env.siteTitle,
      locale: "en_US",
      publishedTime: published,
      modifiedTime: modifiedDate(post),
      authors: [byline.name],
      tags: post.tags,
      section: sectionFor(post),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image.url],
      site: env.twitterHandle ? `@${env.twitterHandle}` : undefined,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const theme = getActiveTheme();
  const allPosts = await getPosts();
  const related = relatedPosts(post, allPosts, 3);
  const section = sectionFor(post);
  const iso = publishDate(post);
  const feature = theme.article === "feature";
  const dropCap = Boolean(theme.features?.dropCap);

  return (
    <>
      <JsonLd data={articleLd(post)} />
      <JsonLd data={breadcrumbLd(post)} />

      <article className="px-6 py-10">
        {/* Header, constrained to the reading measure */}
        <header className="container-content">
          <nav className="mb-6 flex items-center gap-2 text-xs text-muted">
            <Link href="/" className="ul-link hover:text-foreground">
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link href={sectionHref(section)} className="ul-link hover:text-foreground">
              {section}
            </Link>
          </nav>

          <Kicker post={post} className="mb-3 text-sm" />
          <h1
            className={`${feature ? "display" : "font-display"} text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl md:text-5xl`}
          >
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-5 text-xl leading-relaxed text-fg-soft">
              {post.excerpt}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
            <PostMeta post={post} variant="byline" readingTime />
            <ShareRow url={postUrl(post)} title={post.title} />
          </div>
        </header>

        {/* Hero cover — breaks out wider on feature layouts */}
        <figure
          className={`mx-auto mt-8 ${feature ? "container-wide" : "container-content"}`}
        >
          <img
            src={coverImageFor(post)}
            alt=""
            className="w-full rounded-[var(--radius)] object-cover"
          />
          <figcaption className="mt-2.5 text-xs text-muted">
            {section} · {formatDate(iso)} · {readingTimeLabel(post)}
          </figcaption>
        </figure>

        {/* Body */}
        <div className="container-content mt-10">
          <PostContent html={post.content} dropCap={dropCap} />

          <div className="mt-12">
            <ShareRow url={postUrl(post)} title={post.title} withLabel />
          </div>

          {env.newsletterEnabled && (
            <NewsletterCTA variant="inline" className="mt-12" />
          )}

          <RelatedPosts posts={related} label={`More in ${section}`} />
        </div>
      </article>
    </>
  );
}

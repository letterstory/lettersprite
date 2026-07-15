import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { env } from "@/env";
import { getPostBySlug, getPosts } from "@/lib/letterbrace/client";
import { coverImageFor } from "@/lib/covers";
import { authorsFromPosts, bylineFor } from "@/lib/author";
import {
  adjacentPosts,
  allSections,
  isLongread,
  modifiedDate,
  publishDate,
  readingTimeLabel,
  sectionFor,
  sectionHref,
  sectionSlug,
  wordCount,
} from "@/lib/editorial";
import { relatedPosts } from "@/lib/related";
import { sanitizePostHtml } from "@/lib/sanitize";
import { articleLd, breadcrumbLd, faqLd } from "@/lib/seo";
import { buildToc } from "@/lib/toc";
import { postUrl } from "@/lib/url";
import { formatDate } from "@/lib/format";
import { getActiveTheme } from "@/themes";
import { AuthorBio } from "@/components/AuthorBio";
import { BackToTop } from "@/components/BackToTop";
import { JsonLd } from "@/components/JsonLd";
import { Kicker } from "@/components/Kicker";
import { NewsletterCTA } from "@/components/NewsletterCTA";
import { PostContent } from "@/components/PostContent";
import { PostMeta } from "@/components/PostMeta";
import { PostNav } from "@/components/PostNav";
import { PostSources } from "@/components/PostSources";
import { ReadingProgress } from "@/components/ReadingProgress";
import { RelatedPosts } from "@/components/RelatedPosts";
import { ShareRow } from "@/components/ShareRow";
import { TableOfContents } from "@/components/TableOfContents";
import { TopicTags } from "@/components/TopicTags";

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
  const { prev, next } = adjacentPosts(post, allPosts);
  const section = sectionFor(post);
  const iso = publishDate(post);
  const feature = theme.article === "feature";
  const dropCap = Boolean(theme.features?.dropCap);

  // Sanitize once, then inject heading anchors and extract the outline for the
  // table of contents — all at build time.
  const { html: bodyHtml, headings } = buildToc(sanitizePostHtml(post.content));

  // The author's full body of work (for the bio card + "view all") and the
  // beats they cover, kept identical to the /authors/[slug] page.
  const byline = bylineFor(post);
  const authorPosts =
    authorsFromPosts(allPosts).find((a) => a.slug === byline.slug)?.posts ?? [post];
  const authorBeats = [...new Set(authorPosts.map((p) => sectionFor(p)))];

  const linkableSlugs = allSections(allPosts).map((s) => sectionSlug(s));
  const words = wordCount(post);
  const faq = faqLd(post, postUrl(post));

  return (
    <>
      <JsonLd data={articleLd(post)} />
      <JsonLd data={breadcrumbLd(post)} />
      {faq && <JsonLd data={faq} />}

      <ReadingProgress />
      <BackToTop />

      <article id="top" className="px-6 py-10">
        {/* Header, constrained to the reading measure */}
        <header className="container-content">
          <nav
            aria-label="Breadcrumb"
            className="no-print mb-6 flex items-center gap-2 text-xs text-muted"
          >
            <Link href="/" className="ul-link hover:text-foreground">
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link href={sectionHref(section)} className="ul-link hover:text-foreground">
              {section}
            </Link>
          </nav>

          <div className="mb-3 flex flex-wrap items-center gap-3">
            <Kicker post={post} className="text-sm" />
            {isLongread(post) && <span className="pill">Long read</span>}
          </div>
          <h1
            className={`${feature ? "display" : "font-display"} text-3xl font-black leading-[1.08] tracking-tight text-balance sm:text-4xl md:text-5xl`}
          >
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="dek mt-5 text-xl leading-relaxed text-fg-soft text-pretty">
              {post.excerpt}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
            <PostMeta
              post={post}
              variant="byline"
              readingTime
              linkAuthor
              showUpdated
            />
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
            {section} · {formatDate(iso)} · {readingTimeLabel(post)} ·{" "}
            {words.toLocaleString("en-US")} words
          </figcaption>
        </figure>

        {/* Body */}
        <div className="container-content mt-10">
          <TableOfContents headings={headings} className="mb-10" />

          <PostContent html={bodyHtml} sanitized dropCap={dropCap} />

          {/* End-of-story mark (the printer's "fin"). */}
          <div className="fin" aria-hidden />

          {/* Paper Trail — the vetted sources Letterbrace shipped with the
              article. Renders nothing when the article has no trail. */}
          <PostSources sources={post.paperTrail} className="mt-10" />

          <TopicTags
            tags={post.tags}
            linkableSlugs={linkableSlugs}
            className="mt-10"
          />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <ShareRow url={postUrl(post)} title={post.title} withLabel />
            <a
              href="#top"
              className="no-print kicker kicker-muted ul-link hover:text-primary"
            >
              Return to top ↑
            </a>
          </div>

          <AuthorBio
            byline={byline}
            beats={authorBeats}
            storyCount={authorPosts.length}
            className="mt-12"
          />

          {env.newsletterEnabled && (
            <NewsletterCTA variant="inline" className="mt-12 no-print" />
          )}

          <PostNav prev={prev} next={next} className="mt-12 no-print" />

          <RelatedPosts posts={related} label={`More in ${section}`} />
        </div>
      </article>
    </>
  );
}

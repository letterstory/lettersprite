import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { env } from "@/env";
import { getPostBySlug, getPosts } from "@/lib/letterbrace/client";
import { coverAltFor, coverImageFor } from "@/lib/covers";
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
import { articleLd, breadcrumbLd } from "@/lib/seo";
import { buildToc } from "@/lib/toc";
import { postUrl } from "@/lib/url";
import { formatDate } from "@/lib/format";
import { getActiveTheme } from "@/themes";
import { BlitzArticle } from "@/components/article/BlitzArticle";
import { FluxArticle } from "@/components/article/FluxArticle";
import { AuthorBio } from "@/components/AuthorBio";
import { BackToTop } from "@/components/BackToTop";
import { CoverCredit } from "@/components/CoverCredit";
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
    url: coverImageFor(post, 1200),
    width: 1200,
    height: 675,
    alt: coverAltFor(post) || post.title,
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
  const folio = theme.home === "folio";
  const kiosk = theme.home === "kiosk";
  // Franklin Azzi-style: a static full-bleed hero, then a centered header over a
  // narrow reading column.
  const vitrine = theme.home === "vitrine";
  // syg.ma-style: a subtle top-left author byline (no avatar), keeping the cover.
  const commons = theme.home === "commons";
  // Immersive article treatment: a fixed full-bleed hero the content scrolls up
  // over, with an overlaid breadcrumb masthead and the title peeking at the
  // bottom of the first screen. Shared by folio (grafill) and kiosk (Taste).
  const immersive = folio || kiosk;
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

  // Bold tech-portal article (opt-in): kicker + heavy headline + hero, then a
  // serif reading column beside a right rail (ad, Most Popular, mock post).
  if (theme.features?.fluxArticle) {
    return (
      <FluxArticle
        post={post}
        bodyHtml={bodyHtml}
        headings={headings}
        section={section}
        iso={iso}
        byline={byline}
        authorBeats={authorBeats}
        authorPostsCount={authorPosts.length}
        related={related}
        prev={prev}
        next={next}
        linkableSlugs={linkableSlugs}
        dropCap={dropCap}
        allPosts={allPosts}
        words={words}
      />
    );
  }

  // Culture-news article (opt-in): centered title, sticky meta/share rail, a
  // summary box, and a sticky ad rail. Self-contained, so it returns early.
  if (theme.features?.blitzArticle) {
    return (
      <BlitzArticle
        post={post}
        bodyHtml={bodyHtml}
        headings={headings}
        section={section}
        iso={iso}
        byline={byline}
        authorBeats={authorBeats}
        authorPostsCount={authorPosts.length}
        related={related}
        prev={prev}
        next={next}
        linkableSlugs={linkableSlugs}
        dropCap={dropCap}
      />
    );
  }

  return (
    <>
      <JsonLd data={articleLd(post)} />
      <JsonLd data={breadcrumbLd(post)} />

      <ReadingProgress />
      <BackToTop />

      {/* Immersive (folio / kiosk) — a fixed full-bleed hero the content scrolls
          up over, so the image "dies" into the background. The masthead overlays
          it (see globals.css); the article below is opaque and pulled down 80vh. */}
      {immersive && (
        <div
          data-folio-hero={folio ? "" : undefined}
          data-kiosk-hero={kiosk ? "" : undefined}
          className={`fixed inset-x-0 top-0 z-0 h-screen w-full overflow-hidden ${kiosk ? "bg-background" : "bg-heading"}`}
        >
          {kiosk ? (
            /* Kiosk: cover art is a whole illustration — show it uncropped
               (contain) on cream, centred in the space above the title band. */
            <div className="absolute inset-x-0 top-0 bottom-[32vh] flex items-center justify-center px-6 pt-16">
              <img
                src={coverImageFor(post, 1400)}
                alt={coverAltFor(post)}
                fetchPriority="high"
                decoding="async"
                className="max-h-full w-auto max-w-6xl object-contain"
              />
            </div>
          ) : (
            <>
              <img
                src={coverImageFor(post, 1600)}
                alt={coverAltFor(post)}
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />
            </>
          )}
          {/* Overlaid breadcrumb masthead: wordmark — section — title. */}
          <div className="absolute inset-x-0 top-0 z-20">
            <div
              className={`container-wide flex items-center gap-3 px-6 py-5 ${kiosk ? "text-heading" : "text-white"}`}
            >
              <Link
                href="/"
                className={`shrink-0 font-display text-xl font-extrabold tracking-tight ${kiosk ? "text-heading" : "text-white"}`}
              >
                {env.siteTitle}
              </Link>
              <span aria-hidden className={kiosk ? "text-foreground/30" : "text-white/40"}>
                ——
              </span>
              <Link
                href={sectionHref(section)}
                className={`hidden shrink-0 ${kiosk ? "font-mono" : "font-sans"} text-[0.7rem] font-semibold uppercase tracking-[0.12em] sm:inline ${kiosk ? "text-heading" : "text-white"}`}
              >
                {section}
              </Link>
              <span
                aria-hidden
                className={`hidden sm:inline ${kiosk ? "text-foreground/30" : "text-white/40"}`}
              >
                ——
              </span>
              <span
                className={`min-w-0 truncate ${kiosk ? "font-mono" : "font-sans"} text-[0.7rem] font-semibold uppercase tracking-[0.12em] ${kiosk ? "text-foreground/70" : "text-white/90"}`}
              >
                {post.title}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Franklin Azzi: a static full-bleed cover hero above a centered header. */}
      {vitrine && (
        <div className="w-full overflow-hidden bg-surfaceAlt">
          <img
            src={coverImageFor(post, 1600)}
            alt={coverAltFor(post)}
            fetchPriority="high"
            decoding="async"
            className="h-[42vh] w-full object-cover sm:h-[54vh]"
          />
        </div>
      )}

      <article
        id="top"
        className={
          immersive
            ? `relative z-10 ${kiosk ? "mt-[68vh]" : "mt-[80vh]"} bg-background px-6 pb-10 pt-9`
            : vitrine
              ? "relative z-10 -mt-24 px-6 pb-10 sm:-mt-36"
              : "px-6 py-10"
        }
      >
        {/* Header, constrained to the reading measure */}
        <header
          className={`container-content ${vitrine ? "bg-background/70 px-6 pt-9 text-center backdrop-blur-[3px] sm:px-10" : ""}`}
        >
          {/* syg.ma-style subtle top-left byline: author (no avatar), linked to
              the author's other Salesly pieces, plus date and reading time. */}
          {commons && (
            <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.82rem] text-muted">
              <Link
                href={`/authors/${byline.slug}`}
                className="font-medium text-heading underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
              >
                {byline.name}
              </Link>
              <span aria-hidden>·</span>
              <span>{formatDate(iso)}</span>
              <span aria-hidden>·</span>
              <span>{readingTimeLabel(post)}</span>
            </div>
          )}
          <nav
            aria-label="Breadcrumb"
            className={`no-print mb-6 flex items-center gap-2 text-xs text-muted ${immersive || vitrine || commons ? "hidden" : ""}`}
          >
            <Link href="/" className="ul-link hover:text-foreground">
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link href={sectionHref(section)} className="ul-link hover:text-foreground">
              {section}
            </Link>
          </nav>

          <div
            className={`mb-3 flex flex-wrap items-center gap-3 ${vitrine ? "justify-center" : ""}`}
          >
            <Kicker post={post} className="text-sm" />
            {isLongread(post) && <span className="pill">Long read</span>}
          </div>
          <h1
            className={`${feature ? "display" : "font-display"} ${folio ? "uppercase" : ""} ${commons ? "font-normal tracking-normal" : "font-black tracking-tight"} text-3xl leading-[1.08] text-balance sm:text-4xl md:text-5xl`}
          >
            {post.title}
          </h1>
          {post.dek && (
            <p className="dek mt-5 text-xl leading-relaxed text-fg-soft text-pretty">
              {post.dek}
            </p>
          )}

          {!commons && (
            <div
              className={`mt-7 flex flex-wrap items-center gap-4 border-y border-border py-4 ${vitrine ? "justify-center" : "justify-between"}`}
            >
              <PostMeta
                post={post}
                variant="byline"
                readingTime
                linkAuthor
                showUpdated
              />
              {!vitrine && <ShareRow url={postUrl(post)} title={post.title} />}
            </div>
          )}
        </header>

        {/*
          Hero cover — breaks out wider on feature layouts.

          `aspect-[3/2]` is not decoration: it is the only thing bounding this
          image's height. Without it `object-cover` has no box to cover, so the
          hero renders at whatever aspect the source happens to be and one
          oddly-shaped cover produces a hero taller than the viewport. Every
          other cover slot in the app is constrained the same way — see `Cover`
          in components/Story.tsx. 3:2 matches what Letterbrace mints, so a
          generated cover is shown whole rather than cropped.
        */}
        {!immersive && !vitrine && (
        <figure
          className={`mx-auto mt-8 ${feature ? "container-wide" : "container-content"}`}
        >
          <img
            src={coverImageFor(post, 1600)}
            alt={coverAltFor(post)}
            fetchPriority="high"
            decoding="async"
            className="aspect-[3/2] w-full rounded-[var(--radius)] object-cover"
          />
          <figcaption className="mt-2.5 text-xs text-muted">
            <span>
              {section} · {formatDate(iso)} · {readingTimeLabel(post)} ·{" "}
              {words.toLocaleString("en-US")} words
            </span>
            {/* Its own line: a photo credit is an obligation to a person, not
                another stat in the dateline run. */}
            <CoverCredit credit={post.coverCredit} className="mt-1 block" />
          </figcaption>
        </figure>
        )}

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

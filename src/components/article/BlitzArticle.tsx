import Link from "@/components/Link";
import { env } from "@/env";
import type { Post } from "@/lib/letterbrace/types";
import type { Byline } from "@/lib/author";
import type { Heading } from "@/lib/toc";
import { coverAltFor, coverImageFor } from "@/lib/covers";
import { isLongread, readingTimeLabel, sectionHref } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { postUrl } from "@/lib/url";
import { articleLd, breadcrumbLd } from "@/lib/seo";
import { AdSlot } from "@/components/AdSlot";
import { AuthorBio } from "@/components/AuthorBio";
import { BackToTop } from "@/components/BackToTop";
import { CoverCredit } from "@/components/CoverCredit";
import { JsonLd } from "@/components/JsonLd";
import { Kicker } from "@/components/Kicker";
import { NewsletterCTA } from "@/components/NewsletterCTA";
import { PostContent } from "@/components/PostContent";
import { PostNav } from "@/components/PostNav";
import { PostSources } from "@/components/PostSources";
import { ReadingProgress } from "@/components/ReadingProgress";
import { RelatedPosts } from "@/components/RelatedPosts";
import { TableOfContents } from "@/components/TableOfContents";
import { TopicTags } from "@/components/TopicTags";

export type BlitzArticleProps = {
  post: Post;
  bodyHtml: string;
  headings: Heading[];
  section: string;
  iso: string;
  byline: Byline;
  authorBeats: string[];
  authorPostsCount: number;
  related: Post[];
  prev: Post | null;
  next: Post | null;
  linkableSlugs: string[];
  dropCap: boolean;
};

/** A labelled row in the vertical share rail. */
function ShareRowItem({
  href,
  label,
  children,
  external = true,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer nofollow" }
        : {})}
      className="flex items-center gap-3 text-sm text-heading transition-colors hover:text-primary"
    >
      <span className="flex h-4 w-4 items-center justify-center text-muted transition-colors group-hover:text-primary">
        {children}
      </span>
      {label}
    </a>
  );
}

/**
 * Blitz article — a culture-magazine layout: a centered title + dek, then a
 * three-column body of a sticky left meta/share rail, the reading column (hero →
 * Summary box → story), and a sticky right ad rail.
 */
export function BlitzArticle({
  post,
  bodyHtml,
  headings,
  section,
  iso,
  byline,
  authorBeats,
  authorPostsCount,
  related,
  prev,
  next,
  linkableSlugs,
  dropCap,
}: BlitzArticleProps) {
  const url = postUrl(post);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(post.title);
  const summary = post.excerpt || post.dek;

  return (
    <>
      <JsonLd data={articleLd(post)} />
      <JsonLd data={breadcrumbLd(post)} />
      <ReadingProgress />
      <BackToTop />

      <article id="top" className="px-6 py-12">
        {/* Centered title + dek. Wide measure so the headline runs horizontally
            rather than stacking into a tall column. */}
        <header className="mx-auto max-w-5xl text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
            <Kicker post={post} className="text-sm" />
            {isLongread(post) && <span className="pill">Long read</span>}
          </div>
          <h1 className="font-display text-3xl font-bold leading-[1.06] tracking-[-0.01em] text-balance sm:text-4xl md:text-5xl">
            {post.title}
          </h1>
          {post.dek && (
            <p className="dek mx-auto mt-5 max-w-3xl text-xl leading-relaxed text-fg-soft text-pretty">
              {post.dek}
            </p>
          )}
        </header>

        {/* Three-column body: meta/share rail · reading column · ad rail. */}
        <div className="container-wide mt-12 grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)_300px]">
          {/* Left: sticky meta + vertical share rail. */}
          <aside className="hidden lg:block">
            <div className="sticky top-44 flex flex-col gap-4">
              <Link href={sectionHref(section)} className="kicker text-primary">
                {section}
              </Link>
              <div className="text-sm text-muted">{formatDate(iso)}</div>
              <div className="flex items-center gap-1.5 text-sm text-muted">
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-accent" fill="currentColor" aria-hidden>
                  <path d="M2 1.5v9l8-4.5z" />
                </svg>
                {readingTimeLabel(post)}
              </div>

              <div className="mt-2 border-t border-border pt-4">
                <div className="kicker kicker-muted mb-1.5">Text by</div>
                <Link
                  href={`/authors/${byline.slug}`}
                  className="text-sm font-semibold text-heading transition-colors hover:text-primary"
                >
                  {byline.name}
                </Link>
              </div>

              {post.coverCredit?.required && (
                <div className="border-t border-border pt-4">
                  <div className="kicker kicker-muted mb-1.5">Image credit</div>
                  <CoverCredit
                    credit={post.coverCredit}
                    className="text-sm font-semibold text-heading"
                  />
                </div>
              )}

              <div className="no-print border-t border-border pt-4">
                <div className="kicker kicker-muted mb-3">Share this article</div>
                <div className="flex flex-col gap-3">
                  <ShareRowItem href={url} label="Link" external={false}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
                      <path d="M9 15 15 9" />
                      <path d="M11 6.5 12.6 5a3.5 3.5 0 0 1 5 5l-1.6 1.5" />
                      <path d="M13 17.5 11.4 19a3.5 3.5 0 0 1-5-5l1.6-1.5" />
                    </svg>
                  </ShareRowItem>
                  <ShareRowItem href={`https://twitter.com/intent/tweet?text=${t}&url=${u}`} label="Share">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                      <path d="M18.9 1.6h3.5l-7.6 8.7L23.7 22h-7l-5.5-7.2L4.9 22H1.4l8.1-9.3L.7 1.6h7.2l5 6.6 5.9-6.6Zm-1.2 18.3h1.9L6.9 3.6H4.8l12.9 16.3Z" />
                    </svg>
                  </ShareRowItem>
                  <ShareRowItem href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} label="Share">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                      <path d="M14 8.5V7c0-.8.5-1 .9-1H17V3h-2.6C11.7 3 11 5 11 6.4v2.1H9V12h2v9h3v-9h2.3l.4-3.5H14Z" />
                    </svg>
                  </ShareRowItem>
                  <ShareRowItem href={`mailto:?subject=${t}&body=${u}`} label="Email" external={false}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </ShareRowItem>
                </div>
              </div>
            </div>
          </aside>

          {/* Center: hero → Summary box → body. */}
          <div className="min-w-0">
            <figure>
              <img
                src={coverImageFor(post, 1600)}
                alt={coverAltFor(post)}
                fetchPriority="high"
                decoding="async"
                className="aspect-[3/2] w-full bg-surfaceAlt object-cover"
              />
            </figure>

            {summary && (
              <div className="mt-8 border border-border bg-surface p-6">
                <h2 className="font-display text-lg font-bold text-heading">Summary</h2>
                <p className="mt-3 leading-relaxed text-fg-soft">{summary}</p>
              </div>
            )}

            <div className="mt-10">
              <TableOfContents headings={headings} className="mb-10" />

              <PostContent html={bodyHtml} sanitized dropCap={dropCap} />

              <div className="fin" aria-hidden />

              <PostSources sources={post.paperTrail} className="mt-10" />

              <TopicTags
                tags={post.tags}
                linkableSlugs={linkableSlugs}
                className="mt-10"
              />

              <div className="mt-8 flex items-center justify-end border-t border-border pt-6">
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
                storyCount={authorPostsCount}
                className="mt-12"
              />

              {env.newsletterEnabled && (
                <NewsletterCTA variant="inline" className="mt-12 no-print" />
              )}

              <PostNav prev={prev} next={next} className="mt-12 no-print" />

              <RelatedPosts posts={related} label={`More in ${section}`} />
            </div>
          </div>

          {/* Right: sticky ad rail. */}
          <aside className="hidden lg:block">
            <div className="sticky top-44">
              <AdSlot house="tower" minHeightClass="min-h-[600px]" />
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}

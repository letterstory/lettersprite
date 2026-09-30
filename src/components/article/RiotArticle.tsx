import Link from "@/components/Link";
import { env } from "@/env";
import type { Post } from "@/lib/letterbrace/types";
import type { Byline } from "@/lib/author";
import type { Heading } from "@/lib/toc";
import { coverAltFor, coverImageFor } from "@/lib/covers";
import { readingTimeLabel, sectionHref } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { postUrl } from "@/lib/url";
import { articleLd, breadcrumbLd } from "@/lib/seo";
import { AuthorBio } from "@/components/AuthorBio";
import { BackToTop } from "@/components/BackToTop";
import { CoverCredit } from "@/components/CoverCredit";
import { JsonLd } from "@/components/JsonLd";
import { NewsletterCTA } from "@/components/NewsletterCTA";
import { PostContent } from "@/components/PostContent";
import { PostNav } from "@/components/PostNav";
import { PostSources } from "@/components/PostSources";
import { ReadingProgress } from "@/components/ReadingProgress";
import { RelatedPosts } from "@/components/RelatedPosts";
import { ShareRow } from "@/components/ShareRow";
import { TableOfContents } from "@/components/TableOfContents";
import { TopicTags } from "@/components/TopicTags";
import { FakeAd } from "@/components/FakeAd";

export type RiotArticleProps = {
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
  allPosts: Post[];
  words: number;
};

/**
 * Riot article — a FURFUR story page (furfur.me/furfur/…): the headline is
 * burned into a big hero image (kicker + condensed uppercase title + meta over a
 * dark scrim), a share row + "Text:" byline beneath, then a serif reading column
 * with orange links beside a sticky rail (house ad + Most Read). Sharp corners.
 */
export function RiotArticle({
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
  allPosts,
  words,
}: RiotArticleProps) {
  const url = postUrl(post);
  const popular = allPosts.slice(0, 5);

  return (
    <>
      <JsonLd data={articleLd(post)} />
      <JsonLd data={breadcrumbLd(post)} />
      <ReadingProgress />
      <BackToTop />

      <article id="top" className="container-wide px-4 py-8 sm:px-6">
        {/* Burned-in hero: headline over the cover image. */}
        <header className="relative mx-auto max-w-5xl overflow-hidden bg-secondary">
          <img
            src={coverImageFor(post, 1600)}
            alt={coverAltFor(post)}
            fetchPriority="high"
            decoding="async"
            className="aspect-[16/10] w-full object-cover opacity-90"
          />
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-8 text-center sm:pb-10">
            <Link href={sectionHref(section)} className="font-display text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-70">
              {section}
            </Link>
            <h1 className="mt-3 max-w-[22ch] font-display text-3xl font-bold uppercase leading-[0.98] tracking-[0.005em] text-white text-balance sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 flex items-center gap-3 font-display text-[0.7rem] font-medium uppercase tracking-[0.12em] text-white/75">
              <span>{formatDate(iso)}</span>
              <span aria-hidden className="text-white/40">·</span>
              <span>{readingTimeLabel(post)}</span>
              <span aria-hidden className="text-white/40">·</span>
              <span>{words.toLocaleString("en-US")} words</span>
            </p>
          </div>
        </header>
        <CoverCredit credit={post.coverCredit} className="mx-auto mt-2 block max-w-5xl text-xs text-muted" />

        {/* Share row + "Text:" byline. */}
        <div className="mx-auto mt-6 flex max-w-5xl flex-wrap items-center justify-between gap-4 border-y-2 border-secondary py-3">
          <ShareRow url={url} title={post.title} withLabel />
          <p className="font-display text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Text:{" "}
            <Link href={`/authors/${byline.slug}`} className="text-primary transition-opacity hover:opacity-70">
              {byline.name}
            </Link>
          </p>
        </div>

        {post.dek && (
          <p className="mx-auto mt-6 max-w-3xl font-heading text-xl font-bold leading-snug text-heading text-pretty">
            {post.dek}
          </p>
        )}

        {/* FURFUR offset: reading column pushed right, sticky rail in the left
            gutter. DOM keeps the body first so mobile reads body → rail. */}
        <div className="mx-auto mt-8 grid max-w-5xl gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,38rem)]">
          <div className="min-w-0 lg:order-2">
            <TableOfContents headings={headings} className="mb-10" />
            <PostContent html={bodyHtml} sanitized dropCap={dropCap} />
            <div className="fin" aria-hidden />
            <PostSources sources={post.paperTrail} className="mt-10" />
            <TopicTags tags={post.tags} linkableSlugs={linkableSlugs} className="mt-10" />
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t-2 border-secondary pt-6">
              <ShareRow url={url} title={post.title} withLabel />
              <a href="#top" className="no-print font-display text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted transition-colors hover:text-primary">
                Return to top ↑
              </a>
            </div>
            <AuthorBio byline={byline} beats={authorBeats} storyCount={authorPostsCount} className="mt-12" />
            {env.newsletterEnabled && <NewsletterCTA variant="inline" className="mt-12 no-print" />}
            <PostNav prev={prev} next={next} className="mt-12 no-print" />
            <RelatedPosts posts={related} label={`More in ${section}`} />
          </div>

          <aside className="min-w-0 lg:order-1">
            <div className="space-y-8 lg:sticky lg:top-6">
              <div className="relative overflow-hidden">
                <FakeAd variant="box" seed={2} />
              </div>
              <div>
                <h2 className="flex items-center gap-2.5 border-b-4 border-secondary pb-2 font-display text-lg font-semibold uppercase tracking-[0.08em] text-heading">
                  <span aria-hidden className="h-4 w-2.5 bg-primary" />
                  Most Read
                </h2>
                <ol className="mt-2 divide-y divide-border">
                  {popular.map((p, i) => (
                    <li key={p.id} className="group flex gap-3.5 py-3.5">
                      <span className="font-display text-xl font-bold leading-none text-primary">{String(i + 1).padStart(2, "0")}</span>
                      <Link href={`/posts/${p.slug}`} className="font-heading text-base font-bold leading-snug text-heading transition-colors group-hover:text-primary">
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}

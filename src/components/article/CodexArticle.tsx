import Link from "@/components/Link";
import { env } from "@/env";
import type { Post } from "@/lib/letterbrace/types";
import type { Byline } from "@/lib/author";
import type { Heading } from "@/lib/toc";
import { coverAltFor, coverImageFor } from "@/lib/covers";
import { sectionHref } from "@/lib/editorial";
import { postUrl } from "@/lib/url";
import { articleLd, breadcrumbLd } from "@/lib/seo";
import { AuthorCard } from "@/components/AuthorCard";
import { BackToTop } from "@/components/BackToTop";
import { CoverCredit } from "@/components/CoverCredit";
import { DisclosureLabel } from "@/components/DisclosureLabel";
import { JsonLd } from "@/components/JsonLd";
import { NewsletterCTA } from "@/components/NewsletterCTA";
import { PostContent } from "@/components/PostContent";
import { PostMeta } from "@/components/PostMeta";
import { PostNav } from "@/components/PostNav";
import { PostSources } from "@/components/PostSources";
import { ReadingProgress } from "@/components/ReadingProgress";
import { RelatedPosts } from "@/components/RelatedPosts";
import { ShareRow } from "@/components/ShareRow";
import { SponsorBadge } from "@/components/SponsorBadge";
import { TableOfContents } from "@/components/TableOfContents";
import { TopicTags } from "@/components/TopicTags";

export type CodexArticleProps = {
  post: Post;
  bodyHtml: string;
  headings: Heading[];
  section: string;
  iso: string | null;
  byline: Byline;
  authorPostsCount: number;
  related: Post[];
  prev: Post | null;
  next: Post | null;
  linkableSlugs: string[];
  dropCap: boolean;
};

/**
 * Codex article — every.to's reading page: an edge-to-edge hero (no card, no
 * radius), a section-color kicker chip beside the section name, a serif
 * headline + dek, an inline byline/date/share row, then the serif reading
 * column. `data-codex-article` on the root is the hook `body:has()` in
 * globals.css reads to flip the shared masthead from black to cream (see
 * codex.ts) — this component owns that marker, not the page shell.
 */
export function CodexArticle({
  post,
  bodyHtml,
  headings,
  section,
  byline,
  authorPostsCount,
  related,
  prev,
  next,
  linkableSlugs,
  dropCap,
}: CodexArticleProps) {
  const url = postUrl(post);

  return (
    <>
      <JsonLd data={articleLd(post)} />
      <JsonLd data={breadcrumbLd(post)} />
      <ReadingProgress />
      <BackToTop />

      <article id="top" data-codex-article>
        <div className="disclosure-frame w-full overflow-hidden bg-surfaceAlt">
          <img
            src={coverImageFor(post, 1800)}
            alt={coverAltFor(post)}
            fetchPriority="high"
            decoding="async"
            className="aspect-[21/9] w-full object-cover sm:aspect-[12/5]"
          />
          <SponsorBadge disclosure={post.sponsorDisclosure} />
        </div>
        <div className="container-wide px-4 pt-2 xl:px-10">
          <CoverCredit credit={post.coverCredit} className="text-xs text-muted" />
        </div>

        <div className="container-content px-6 pb-10 pt-10">
          <header>
            <div className="mb-4 flex items-center gap-2.5">
              <span
                className="h-5 w-5 shrink-0 rounded-[3px]"
                style={{ backgroundColor: byline.color }}
                aria-hidden
              />
              <Link
                href={sectionHref(section)}
                className="font-display text-base font-semibold ul-link hover:text-primary"
              >
                {section}
              </Link>
            </div>

            <h1 className="font-display text-4xl font-normal leading-[1.08] text-balance sm:text-5xl md:text-[3.25rem]">
              {post.title}
            </h1>
            {post.dek && (
              <p className="dek mt-5 text-xl font-normal leading-relaxed text-fg-soft text-pretty">
                {post.dek}
              </p>
            )}

            <DisclosureLabel disclosure={post.sponsorDisclosure} className="mt-6" />

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-y border-border py-5">
              <PostMeta post={post} variant="byline" readingTime linkAuthor showUpdated />
              <ShareRow url={url} title={post.title} />
            </div>
          </header>

          <div className="mt-10">
            <TableOfContents headings={headings} className="mb-10" />

            <PostContent html={bodyHtml} sanitized dropCap={dropCap} disclosure={post.sponsorDisclosure} />

            <div className="fin" aria-hidden />

            <PostSources sources={post.paperTrail} className="mt-10" />

            <TopicTags tags={post.tags} linkableSlugs={linkableSlugs} className="mt-10" />

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
              <ShareRow url={url} title={post.title} withLabel />
              <a href="#top" className="no-print kicker kicker-muted ul-link hover:text-primary">
                Return to top ↑
              </a>
            </div>

            <AuthorCard byline={byline} storyCount={authorPostsCount} className="mt-12" />

            {env.newsletterEnabled && (
              <NewsletterCTA variant="inline" className="mt-12 no-print" />
            )}

            <PostNav prev={prev} next={next} className="mt-12 no-print" />

            <RelatedPosts posts={related} label={`More in ${section}`} />
          </div>
        </div>
      </article>
    </>
  );
}

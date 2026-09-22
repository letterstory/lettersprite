import Link from "@/components/Link";
import { env } from "@/env";
import type { Post } from "@/lib/letterbrace/types";
import type { Byline } from "@/lib/author";
import type { Heading } from "@/lib/toc";
import { coverAltFor, coverImageFor } from "@/lib/covers";
import {
  isLongread,
  publishDate,
  readingTimeLabel,
  sectionHref,
} from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { postUrl } from "@/lib/url";
import { articleLd, breadcrumbLd } from "@/lib/seo";
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
import { FakeAd } from "@/components/FakeAd";
import { MockPost } from "@/components/MockPost";

export type FluxArticleProps = {
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
 * Flux article — a bold tech-portal story page: a kicker + heavy headline + dek
 * over a byline rule, a full-width hero, an in-article ad, then a serif reading
 * column beside a sticky right rail (ad, numbered Most Popular, mock post).
 */
export function FluxArticle({
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
}: FluxArticleProps) {
  const url = postUrl(post);
  const popular = allPosts.slice(0, 5);

  return (
    <>
      <JsonLd data={articleLd(post)} />
      <JsonLd data={breadcrumbLd(post)} />
      <ReadingProgress />
      <BackToTop />

      <article id="top" className="container-wide px-6 py-8">
        {/* Header. */}
        <header className="mx-auto max-w-4xl">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <Kicker post={post} className="text-sm" />
            {isLongread(post) && <span className="pill">Long read</span>}
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.01em] text-heading text-balance sm:text-[3.15rem]">
            {post.title}
          </h1>
          {post.dek && (
            <p className="mt-4 text-xl leading-snug text-fg-soft text-pretty">{post.dek}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y-2 border-foreground py-3">
            <PostMeta post={post} variant="byline" readingTime linkAuthor showUpdated />
            <ShareRow url={url} title={post.title} />
          </div>
        </header>

        {/* Full-width hero. */}
        <figure className="mx-auto mt-8 max-w-5xl">
          <img
            src={coverImageFor(post, 1600)}
            alt={coverAltFor(post)}
            fetchPriority="high"
            decoding="async"
            className="aspect-[16/9] w-full bg-surfaceAlt object-cover"
          />
          <figcaption className="mt-2.5 text-xs text-muted">
            <span>
              {section} · {formatDate(iso)} · {readingTimeLabel(post)} ·{" "}
              {words.toLocaleString("en-US")} words
            </span>
            <CoverCredit credit={post.coverCredit} className="mt-1 block" />
          </figcaption>
        </figure>

        <FakeAd variant="leaderboard" seed={1} className="mx-auto my-9 max-w-3xl border-y border-border py-6" />

        {/* Reading column + right rail. */}
        <div className="mx-auto mt-2 grid max-w-5xl gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <TableOfContents headings={headings} className="mb-10" />
            <PostContent html={bodyHtml} sanitized dropCap={dropCap} />
            <div className="fin" aria-hidden />
            <PostSources sources={post.paperTrail} className="mt-10" />
            <TopicTags tags={post.tags} linkableSlugs={linkableSlugs} className="mt-10" />
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t-2 border-foreground pt-6">
              <ShareRow url={url} title={post.title} withLabel />
              <a href="#top" className="no-print kicker kicker-muted ul-link hover:text-primary">
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

          <aside className="min-w-0">
            <div className="space-y-8 lg:sticky lg:top-6">
              <FakeAd variant="box" seed={4} />
              <div>
                <h2 className="border-t-2 border-foreground pt-3 font-display text-[0.72rem] font-bold uppercase tracking-[0.12em] text-primary">
                  Most Popular
                </h2>
                <ol className="mt-2 divide-y divide-border">
                  {popular.map((p, i) => (
                    <li key={p.id} className="group flex gap-3.5 py-3.5">
                      <span className="font-display text-xl font-extrabold leading-none text-primary">
                        {i + 1}
                      </span>
                      <Link
                        href={`/posts/${p.slug}`}
                        className="font-display text-base font-extrabold leading-snug text-heading transition-colors group-hover:text-primary"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
              <MockPost seed={1} />
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}

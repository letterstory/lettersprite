import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { AdSlot } from "@/components/AdSlot";
import { publishDate, readingTimeLabel, sectionFor, sectionHref } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { coverAltFor, coverImageFor } from "@/lib/covers";
import { BlitzTabs } from "./BlitzTabs";

/**
 * Blitz front — a bold culture-news grid: a three-column hero (text lead | big
 * image | image+text secondary) over a dense four-column feed of cards, each
 * with a bold headline and a small metric row (a play glyph + reading time,
 * fitting a video publication, plus a date and a bookmark). Stark white, black
 * headlines, colour from the covers and one accent.
 */

function Category({ post, className = "" }: { post: Post; className?: string }) {
  const s = sectionFor(post);
  return (
    <Link
      href={sectionHref(s)}
      className={`text-[0.66rem] font-bold uppercase tracking-[0.1em] text-primary transition-opacity hover:opacity-70 ${className}`}
    >
      {s}
    </Link>
  );
}

function Metrics({ post }: { post: Post }) {
  return (
    <div className="mt-2 flex items-center gap-3 text-[0.72rem] text-muted">
      <span className="flex items-center gap-1">
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-accent" fill="currentColor" aria-hidden>
          <path d="M2 1.5v9l8-4.5z" />
        </svg>
        {readingTimeLabel(post)}
      </span>
      <span aria-hidden>·</span>
      <span>{formatDate(publishDate(post))}</span>
      <svg
        viewBox="0 0 24 24"
        className="ml-auto h-3.5 w-3.5 text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M6 3h12v18l-6-4-6 4z" />
      </svg>
    </div>
  );
}

/** A river row: landscape image beside a category / headline / dek / metric block. */
function RiverItem({ post }: { post: Post }) {
  return (
    <article className="group grid gap-5 border-b border-border py-7 md:grid-cols-2 md:items-center">
      <Link
        href={`/posts/${post.slug}`}
        className="order-1 block overflow-hidden bg-surfaceAlt md:order-2"
        style={{ aspectRatio: "16/10" }}
      >
        <img
          src={coverImageFor(post, 720)}
          alt={coverAltFor(post)}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="order-2 md:order-1">
        <Category post={post} />
        <Link href={`/posts/${post.slug}`}>
          <h3 className="mt-2 text-2xl font-bold leading-[1.1] tracking-[-0.01em] text-heading text-balance transition-colors group-hover:text-primary sm:text-[1.7rem]">
            {post.title}
          </h3>
        </Link>
        {post.dek && (
          <p className="mt-3 line-clamp-3 leading-relaxed text-fg-soft">{post.dek}</p>
        )}
        <Metrics post={post} />
      </div>
    </article>
  );
}

/** A compact grid card: image, category, bold headline, metric row. */
function Card({ post }: { post: Post }) {
  return (
    <article className="group flex flex-col">
      <Link
        href={`/posts/${post.slug}`}
        className="block aspect-[4/3] overflow-hidden bg-surfaceAlt"
      >
        <img
          src={coverImageFor(post, 560)}
          alt={coverAltFor(post)}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <Category post={post} className="mt-3" />
      <Link href={`/posts/${post.slug}`}>
        <h3 className="mt-1 text-[1.05rem] font-bold leading-[1.15] tracking-[-0.01em] text-heading text-balance transition-colors group-hover:text-primary">
          {post.title}
        </h3>
      </Link>
      <Metrics post={post} />
    </article>
  );
}

export function BlitzHome({ posts }: { posts: Post[] }) {
  const [lead, second, ...tail] = posts;
  // A row of blog cards surrounding the featured hero (like the grid under the
  // reference's lead story); the remainder flows into the Latest/Popular river.
  const surround = tail.slice(0, 4);
  const riverPosts = tail.slice(4);
  // "Popular" is a stable, deterministic proxy (most in-depth first) — no
  // fabricated analytics; "Latest" keeps the incoming newest-first order.
  const popular = [...riverPosts].sort(
    (a, b) => (b.content?.length ?? 0) - (a.content?.length ?? 0),
  );

  return (
    <div className="container-wide px-6 pb-16">
      {/* Three-column hero: text lead | big image | image+text secondary. */}
      {lead && (
        <section className="grid gap-8 border-b border-border py-8 lg:grid-cols-[1fr_1.7fr_1fr] lg:items-start lg:gap-0 lg:divide-x lg:divide-border">
          <div className="group flex flex-col justify-start lg:pr-8">
            <Category post={lead} />
            <Link href={`/posts/${lead.slug}`}>
              <h1 className="mt-2 text-3xl font-bold leading-[1.05] tracking-[-0.02em] text-heading text-balance transition-colors group-hover:text-primary sm:text-[2.5rem]">
                {lead.title}
              </h1>
            </Link>
            {lead.dek && (
              <p className="mt-3 text-[0.95rem] leading-relaxed text-fg-soft">{lead.dek}</p>
            )}
            <Metrics post={lead} />
          </div>
          <Link
            href={`/posts/${lead.slug}`}
            className="group order-first block aspect-[4/3] overflow-hidden bg-surfaceAlt lg:order-none"
          >
            <img
              src={coverImageFor(lead, 1100)}
              alt={coverAltFor(lead)}
              fetchPriority="high"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </Link>
          {second && (
            <article className="group flex flex-col lg:pl-8">
              <Link
                href={`/posts/${second.slug}`}
                className="block overflow-hidden bg-surfaceAlt"
                style={{ aspectRatio: "4/3" }}
              >
                <img
                  src={coverImageFor(second, 640)}
                  alt={coverAltFor(second)}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </Link>
              <Category post={second} className="mt-3" />
              <Link href={`/posts/${second.slug}`}>
                <h2 className="mt-1 text-xl font-bold leading-[1.12] tracking-[-0.01em] text-heading text-balance transition-colors group-hover:text-primary">
                  {second.title}
                </h2>
              </Link>
              {second.dek && (
                <p className="mt-2 line-clamp-2 text-[0.9rem] leading-relaxed text-fg-soft">
                  {second.dek}
                </p>
              )}
              <Metrics post={second} />
            </article>
          )}
        </section>
      )}

      {/* Blog cards that surround the featured hero: a dense row beneath it. */}
      {surround.length > 0 && (
        <section className="grid grid-cols-2 gap-x-6 gap-y-10 border-b border-border py-10 md:grid-cols-4">
          {surround.map((p) => (
            <Card key={p.id} post={p} />
          ))}
        </section>
      )}

      {/* Latest / Popular river with a sticky ad rail. */}
      <section className="grid gap-10 pt-8 lg:grid-cols-[1fr_300px] lg:gap-0 lg:divide-x lg:divide-border">
        <div className="min-w-0 lg:pr-10">
          <BlitzTabs
            latest={
              <div>
                {riverPosts.map((p) => (
                  <RiverItem key={p.id} post={p} />
                ))}
              </div>
            }
            popular={
              <div>
                {popular.map((p) => (
                  <RiverItem key={p.id} post={p} />
                ))}
              </div>
            }
          />
        </div>
        <aside className="hidden lg:block lg:pl-10">
          <div className="sticky top-44">
            <AdSlot house="tower" minHeightClass="min-h-[600px]" />
          </div>
        </aside>
      </section>

      <div className="mt-14">
        <AdSlot house="banner" minHeightClass="min-h-[90px]" />
      </div>
    </div>
  );
}

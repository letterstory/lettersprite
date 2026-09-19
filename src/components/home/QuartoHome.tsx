import Link from "@/components/Link";
import { env } from "@/env";
import type { Post } from "@/lib/letterbrace/types";
import { bylineFor } from "@/lib/author";
import { publishDate, sectionFor, sectionHref } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { coverAltFor, coverImageFor } from "@/lib/covers";

/**
 * Quarto front — a classic three-column newspaper front: a left rail of stacked
 * cards plus a numbered "Most Read", a centered lead with a secondary story list
 * beneath, a right rail of headline + thumbnail items, and a bottom card row.
 * Warm paper, navy serif headlines, gold small-caps kickers, hairline rules.
 */

function Kicker({ post, className = "" }: { post: Post; className?: string }) {
  const s = sectionFor(post);
  return (
    <Link
      href={sectionHref(s)}
      className={`text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-primary transition-opacity hover:opacity-70 ${className}`}
    >
      {s}
    </Link>
  );
}

function Byline({ post }: { post: Post }) {
  const b = bylineFor(post);
  return (
    <Link href={`/authors/${b.slug}`} className="transition-colors hover:text-primary">
      {b.name}
    </Link>
  );
}

function Meta({ post, className = "" }: { post: Post; className?: string }) {
  return (
    <p className={`mt-1.5 text-[0.82rem] text-muted ${className}`}>
      <Byline post={post} /> · {formatDate(publishDate(post))}
    </p>
  );
}

/** Left-rail card: image, kicker, title, meta. */
function SideCard({ post }: { post: Post }) {
  return (
    <article className="group">
      <Link
        href={`/posts/${post.slug}`}
        className="block aspect-[16/10] overflow-hidden bg-surface"
      >
        <img
          src={coverImageFor(post, 480)}
          alt={coverAltFor(post)}
          loading="lazy"
          className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
        />
      </Link>
      <Kicker post={post} className="mt-3 block" />
      <Link href={`/posts/${post.slug}`}>
        <h3 className="mt-1 font-display text-[1.15rem] font-semibold leading-[1.2] text-heading transition-colors group-hover:text-primary">
          {post.title}
        </h3>
      </Link>
      <Meta post={post} />
    </article>
  );
}

/** Numbered "Most Read" list. */
function MostRead({ posts }: { posts: Post[] }) {
  return (
    <div>
      <h2 className="border-t-2 border-foreground pt-3 font-display text-sm font-semibold uppercase tracking-[0.12em] text-heading">
        Most Read
      </h2>
      <ol className="mt-1 divide-y divide-border">
        {posts.map((post, i) => (
          <li key={post.id} className="group flex gap-3.5 py-3.5">
            <span className="font-display text-2xl font-semibold leading-none text-[color:color-mix(in_srgb,var(--primary)_55%,transparent)]">
              {i + 1}
            </span>
            <div className="min-w-0">
              <Link href={`/posts/${post.slug}`}>
                <h3 className="font-display text-[1.02rem] font-semibold leading-[1.2] text-heading transition-colors group-hover:text-primary">
                  {post.title}
                </h3>
              </Link>
              <Meta post={post} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Centered lead story. */
function Lead({ post }: { post: Post }) {
  return (
    <article className="group text-center">
      <Link
        href={`/posts/${post.slug}`}
        className="block aspect-[4/3] overflow-hidden bg-surface"
      >
        <img
          src={coverImageFor(post, 1100)}
          alt={coverAltFor(post)}
          fetchPriority="high"
          className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
        />
      </Link>
      <Kicker post={post} className="mt-5 inline-block" />
      <Link href={`/posts/${post.slug}`}>
        <h2 className="mt-2 font-display text-[2.1rem] font-semibold leading-[1.06] text-heading text-balance transition-colors group-hover:text-primary sm:text-[2.75rem]">
          {post.title}
        </h2>
      </Link>
      {post.dek && (
        <p className="mx-auto mt-3 max-w-xl text-lg leading-relaxed text-fg-soft text-pretty">
          {post.dek}
        </p>
      )}
      <Meta post={post} className="text-center" />
    </article>
  );
}

/** Center secondary row: text block + right thumbnail. */
function SecondaryRow({ post }: { post: Post }) {
  return (
    <article className="group grid grid-cols-[1fr_auto] items-start gap-5 py-6">
      <div className="min-w-0">
        <Kicker post={post} className="block" />
        <Link href={`/posts/${post.slug}`}>
          <h3 className="mt-1 font-display text-[1.4rem] font-semibold leading-[1.15] text-heading transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>
        {post.dek && (
          <p className="mt-1.5 line-clamp-2 leading-relaxed text-fg-soft">
            {post.dek}
          </p>
        )}
        <Meta post={post} />
      </div>
      <Link
        href={`/posts/${post.slug}`}
        className="block h-24 w-32 shrink-0 overflow-hidden bg-surface"
      >
        <img
          src={coverImageFor(post, 320)}
          alt={coverAltFor(post)}
          loading="lazy"
          className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
        />
      </Link>
    </article>
  );
}

/** Right-rail row: title + meta + small thumbnail. */
function RightRow({ post }: { post: Post }) {
  return (
    <article className="group grid grid-cols-[1fr_auto] items-start gap-3.5 py-4">
      <div className="min-w-0">
        <Link href={`/posts/${post.slug}`}>
          <h3 className="font-display text-[1.05rem] font-semibold leading-[1.2] text-heading transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>
        <Meta post={post} />
      </div>
      <Link
        href={`/posts/${post.slug}`}
        className="block h-16 w-16 shrink-0 overflow-hidden bg-surface"
      >
        <img
          src={coverImageFor(post, 160)}
          alt={coverAltFor(post)}
          loading="lazy"
          className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
        />
      </Link>
    </article>
  );
}

/** Bottom-row image card. */
function ImageCard({ post }: { post: Post }) {
  return (
    <article className="group">
      <Link
        href={`/posts/${post.slug}`}
        className="block aspect-[16/10] overflow-hidden bg-surface"
      >
        <img
          src={coverImageFor(post, 480)}
          alt={coverAltFor(post)}
          loading="lazy"
          className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
        />
      </Link>
      <Kicker post={post} className="mt-3 block" />
      <Link href={`/posts/${post.slug}`}>
        <h3 className="mt-1 font-display text-[1.05rem] font-semibold leading-[1.2] text-heading transition-colors group-hover:text-primary">
          {post.title}
        </h3>
      </Link>
    </article>
  );
}

export function QuartoHome({ posts }: { posts: Post[] }) {
  const lead = posts[0];
  const leftCards = posts.slice(1, 3);
  const mostRead = posts.slice(0, 5);
  const secondary = posts.slice(3, 7);
  const rightList = posts.slice(5, 12);
  const bottom = posts.slice(2, 6);
  const sections = [...new Set(posts.map((p) => sectionFor(p)))];

  return (
    <div className="container-wide px-6 pb-16 pt-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-0">
        {/* Left rail. */}
        <div className="flex flex-col gap-8 lg:border-r lg:border-border lg:pr-8">
          {leftCards.map((p) => (
            <SideCard key={p.id} post={p} />
          ))}
          {mostRead.length > 0 && <MostRead posts={mostRead} />}
        </div>

        {/* Center lead + secondary list. */}
        <div className="lg:px-8">
          {lead && <Lead post={lead} />}
          {secondary.length > 0 && (
            <div className="mt-8 border-t-2 border-foreground">
              <div className="divide-y divide-border">
                {secondary.map((p) => (
                  <SecondaryRow key={p.id} post={p} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right rail. */}
        <div className="lg:border-l lg:border-border lg:pl-8">
          <div className="divide-y divide-border">
            {rightList.map((p) => (
              <RightRow key={p.id} post={p} />
            ))}
          </div>
          {/* Anchor box: about + sections, so the rail never runs blank. */}
          <aside className="mt-8 border-2 border-foreground p-5">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-heading">
              About the Review
            </h2>
            {env.siteDescription && (
              <p className="mt-3 font-display text-[0.98rem] italic leading-relaxed text-fg-soft">
                {env.siteDescription}
              </p>
            )}
            {sections.length > 0 && (
              <>
                <h3 className="mt-5 border-t border-border pt-4 font-display text-sm font-semibold uppercase tracking-[0.12em] text-heading">
                  Sections
                </h3>
                <ul className="mt-2.5 space-y-2">
                  {sections.map((s) => (
                    <li key={s}>
                      <Link
                        href={sectionHref(s)}
                        className="font-display text-[0.98rem] leading-snug text-heading transition-colors hover:text-primary"
                      >
                        {s}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        </div>
      </div>

      {/* Bottom card row. */}
      {bottom.length > 0 && (
        <div className="mt-12 border-t-2 border-foreground pt-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {bottom.map((p) => (
              <ImageCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

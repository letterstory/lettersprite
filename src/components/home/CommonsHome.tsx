import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { AdSlot } from "@/components/AdSlot";
import { env } from "@/env";
import { readingTimeLabel, sectionFor, sectionHref } from "@/lib/editorial";
import { coverAltFor, coverImageFor } from "@/lib/covers";
import { bylineFor } from "@/lib/author";

/**
 * Commons front — a take on syg.ma: a stark hero statement, a thin filter bar,
 * then a dense masonry feed (CSS columns) that mixes plain cards with thin
 * bordered "boxed" cards, square image crops with landscape ones, and image
 * entries with text-only entries — deterministically interleaved so the feed
 * reads varied like syg.ma. Monochrome system type; covers + one blue accent.
 */

type Kind = "img" | "imgSq" | "text";
/** Deterministic shape per position: mixes boxed/plain, square/landscape, image/text. */
function shape(i: number): { box: boolean; kind: Kind } {
  switch (i % 6) {
    case 2:
      return { box: true, kind: "text" }; // framed text card
    case 5:
      return { box: true, kind: "imgSq" }; // framed square-image card
    case 0:
      return { box: false, kind: "imgSq" }; // plain square image
    case 3:
      return { box: false, kind: "text" }; // plain text (top rule)
    default:
      return { box: false, kind: "img" }; // plain landscape image
  }
}

function Meta({ post }: { post: Post }) {
  const b = bylineFor(post);
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.72rem] text-muted">
      <Link href={`/authors/${b.slug}`} className="transition-colors hover:text-primary">
        {b.name}
      </Link>
      <span aria-hidden>·</span>
      <span>{readingTimeLabel(post)}</span>
    </div>
  );
}

function Card({ post, box, kind }: { post: Post; box: boolean; kind: Kind }) {
  const s = sectionFor(post);
  const wrap = box
    ? "border border-foreground p-4"
    : kind === "text"
      ? "border-t-2 border-foreground pt-2.5"
      : "";
  return (
    <article className={`group mb-6 break-inside-avoid ${wrap}`}>
      <Link
        href={sectionHref(s)}
        className="text-[0.72rem] text-muted transition-colors hover:text-primary"
      >
        {s}
      </Link>
      {kind !== "text" && (
        <Link
          href={`/posts/${post.slug}`}
          className="mt-1.5 block overflow-hidden bg-surfaceAlt"
          style={kind === "imgSq" ? { aspectRatio: "1 / 1" } : undefined}
        >
          <img
            src={coverImageFor(post, 640)}
            alt={coverAltFor(post)}
            loading="lazy"
            className={`w-full object-cover transition-opacity duration-300 group-hover:opacity-90 ${kind === "imgSq" ? "h-full" : ""}`}
          />
        </Link>
      )}
      <Link href={`/posts/${post.slug}`}>
        <h3
          className={`mt-2 font-normal text-heading text-balance transition-colors group-hover:text-primary ${
            kind === "text" ? "text-xl leading-[1.2]" : "text-[1.08rem] leading-snug"
          }`}
        >
          {post.title}
        </h3>
      </Link>
      {kind === "text" && post.dek && (
        <p className="mt-2 line-clamp-3 text-[0.85rem] leading-relaxed text-muted">{post.dek}</p>
      )}
      <Meta post={post} />
    </article>
  );
}

export function CommonsHome({ posts }: { posts: Post[] }) {
  const statement = env.siteTagline || env.siteDescription || env.siteTitle;
  const topSections = [...new Set(posts.map((p) => sectionFor(p)))].slice(0, 6);

  return (
    <div className="container-wide px-6 pb-16">
      {/* Hero statement in a bordered box (syg.ma's framed look). */}
      <header className="mt-8 border border-foreground p-6 sm:flex sm:items-end sm:justify-between sm:gap-8 sm:p-9">
        <div>
          <h1 className="max-w-3xl text-[2rem] font-normal leading-[1.05] text-heading text-balance sm:text-[3rem]">
            {statement}
          </h1>
          {topSections.length > 0 && (
            <p className="mt-4 text-[0.95rem] text-muted">{topSections.join("  ·  ")}</p>
          )}
        </div>
        <p className="mt-4 shrink-0 font-mono text-[0.72rem] text-muted sm:mt-0">
          {posts.length} {posts.length === 1 ? "entry" : "entries"} · {env.siteTitle}
        </p>
      </header>

      {/* Filter bar: bordered chips. */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <span className="border border-foreground px-3 py-1.5 text-[0.78rem] font-medium text-heading">
            All
          </span>
          <span className="border border-border px-3 py-1.5 text-[0.78rem] text-muted">Featured</span>
        </div>
        <span className="border border-border px-3 py-1.5 font-mono text-[0.72rem] text-muted">
          {posts.length} {posts.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* Dense masonry feed: mixed boxed/plain, square/landscape, image/text. */}
      <div className="mt-8 gap-x-8 sm:columns-2 lg:columns-3 xl:columns-4">
        {posts.map((p, i) => {
          const { box, kind } = shape(i);
          return <Card key={p.id} post={p} box={box} kind={kind} />;
        })}
      </div>

      <div className="mt-12">
        <AdSlot minHeightClass="min-h-[90px]" />
      </div>
    </div>
  );
}

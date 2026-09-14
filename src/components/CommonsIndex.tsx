import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { readingTimeLabel, sectionFor, sectionHref } from "@/lib/editorial";
import { coverAltFor, coverImageFor } from "@/lib/covers";
import { bylineFor } from "@/lib/author";

/**
 * Commons (syg.ma) section/author index: a minimal title + sibling filter tabs,
 * over the same dense mixed image/text masonry feed as the front.
 */

function Meta({ post }: { post: Post }) {
  const b = bylineFor(post);
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[0.72rem] text-muted">
      <Link href={`/authors/${b.slug}`} className="transition-colors hover:text-primary">
        {b.name}
      </Link>
      <span aria-hidden>·</span>
      <span>{readingTimeLabel(post)}</span>
    </div>
  );
}

type Kind = "img" | "imgSq" | "text";
/** Deterministic shape per position — mirrors CommonsHome: boxed/plain, square/landscape, image/text. */
function shape(i: number): { box: boolean; kind: Kind } {
  switch (i % 6) {
    case 2:
      return { box: true, kind: "text" };
    case 5:
      return { box: true, kind: "imgSq" };
    case 0:
      return { box: false, kind: "imgSq" };
    case 3:
      return { box: false, kind: "text" };
    default:
      return { box: false, kind: "img" };
  }
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
      <Link href={sectionHref(s)} className="text-[0.72rem] text-muted transition-colors hover:text-primary">
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
          className={`mt-2 font-normal text-heading text-balance transition-colors group-hover:text-primary ${kind === "text" ? "text-xl leading-[1.2]" : "text-[1.08rem] leading-snug"}`}
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

export function CommonsIndex({
  title,
  siblings,
  stat,
  posts,
}: {
  title: string;
  siblings: { label: string; href: string }[];
  stat: string;
  posts: Post[];
}) {
  return (
    <div className="container-wide px-6 pb-16">
      <header className="border-b border-border py-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h1 className="text-3xl font-normal text-heading sm:text-4xl">{title}</h1>
          <span className="font-mono text-[0.72rem] text-muted">{stat}</span>
        </div>
        {siblings.length > 0 && (
          <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.8rem]">
            {siblings.map((s) => (
              <Link key={s.href} href={s.href} className="text-muted transition-colors hover:text-primary">
                {s.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <div className="mt-8 gap-x-8 sm:columns-2 lg:columns-3 xl:columns-4">
        {posts.map((p, i) => {
          const { box, kind } = shape(i);
          return <Card key={p.id} post={p} box={box} kind={kind} />;
        })}
      </div>
    </div>
  );
}

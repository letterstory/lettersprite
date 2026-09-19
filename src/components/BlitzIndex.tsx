import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { publishDate, readingTimeLabel, sectionFor, sectionHref } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { coverAltFor, coverImageFor } from "@/lib/covers";

/**
 * Blitz section/author index: a bold title + sibling tabs, over the same dense
 * four-column metric grid as the front.
 */

function Card({ post }: { post: Post }) {
  const s = sectionFor(post);
  return (
    <article className="group flex flex-col">
      <Link
        href={`/posts/${post.slug}`}
        className="block overflow-hidden bg-surfaceAlt"
        style={{ aspectRatio: "4/3" }}
      >
        <img
          src={coverImageFor(post, 560)}
          alt={coverAltFor(post)}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <Link
        href={sectionHref(s)}
        className="mt-3 text-[0.66rem] font-bold uppercase tracking-[0.1em] text-primary transition-opacity hover:opacity-70"
      >
        {s}
      </Link>
      <Link href={`/posts/${post.slug}`}>
        <h3 className="mt-1 text-[1.05rem] font-bold leading-[1.15] tracking-[-0.01em] text-heading text-balance transition-colors group-hover:text-primary">
          {post.title}
        </h3>
      </Link>
      <div className="mt-2 flex items-center gap-3 text-[0.72rem] text-muted">
        <span className="flex items-center gap-1">
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-accent" fill="currentColor" aria-hidden>
            <path d="M2 1.5v9l8-4.5z" />
          </svg>
          {readingTimeLabel(post)}
        </span>
        <span aria-hidden>·</span>
        <span>{formatDate(publishDate(post))}</span>
      </div>
    </article>
  );
}

export function BlitzIndex({
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
      <header className="border-b-2 border-foreground py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h1 className="text-3xl font-bold uppercase tracking-[-0.01em] text-heading sm:text-4xl">
            {title}
          </h1>
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-muted">
            {stat}
          </span>
        </div>
        {siblings.length > 0 && (
          <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {siblings.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-muted transition-colors hover:text-primary"
              >
                {s.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <section className="grid grid-cols-2 gap-x-6 gap-y-10 pt-10 md:grid-cols-3 lg:grid-cols-4">
        {posts.map((p) => (
          <Card key={p.id} post={p} />
        ))}
      </section>
    </div>
  );
}

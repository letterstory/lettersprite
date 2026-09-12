import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { sectionFor, sectionHref } from "@/lib/editorial";
import { coverAltFor, coverImageFor } from "@/lib/covers";

/**
 * Vitrine (Franklin Azzi) section/author index: a minimal uppercase title with a
 * row of sibling tabs, over the same dense captioned image grid as the front.
 */

function Cell({ post }: { post: Post }) {
  const section = sectionFor(post);
  return (
    <article className="group flex flex-col">
      <Link
        href={`/posts/${post.slug}`}
        className="block overflow-hidden bg-surfaceAlt"
        style={{ aspectRatio: "16/10" }}
      >
        <img
          src={coverImageFor(post, 700)}
          alt={coverAltFor(post)}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
        />
      </Link>
      <div className="mt-3">
        <Link
          href={sectionHref(section)}
          className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted transition-colors hover:text-primary"
        >
          {section}
        </Link>
        <Link href={`/posts/${post.slug}`}>
          <h3 className="mt-1.5 text-[0.98rem] font-medium leading-snug tracking-[-0.01em] text-heading text-balance transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>
      </div>
    </article>
  );
}

export function VitrineIndex({
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
    <div className="container-wide px-6 pt-4 pb-16">
      {/* Uppercase title + count, then sibling tabs, then a hairline. */}
      <div className="mb-8 border-b border-border pb-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h1 className="text-[1.7rem] font-semibold uppercase tracking-[-0.01em] text-heading">
            {title}
          </h1>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted">
            {stat}
          </span>
        </div>
        {siblings.length > 0 && (
          <nav className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {siblings.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-muted transition-colors hover:text-primary"
              >
                {s.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-y-12 lg:grid-cols-4">
        {posts.map((p) => (
          <Cell key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}

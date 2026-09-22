import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { publishDate, sectionFor, sectionHref } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { coverAltFor, coverImageFor } from "@/lib/covers";

/**
 * Stark front — a tight square-thumbnail gallery grid with always-on monospace
 * captions, followed by a list band (Most Read + per-section indexes) so the
 * page reads long and dense. Colour comes only from the covers and one accent,
 * on the near-white ground.
 */

function Tile({ post, priority = false }: { post: Post; priority?: boolean }) {
  const section = sectionFor(post);
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative block aspect-square overflow-hidden bg-surfaceAlt"
    >
      <img
        src={coverImageFor(post, 640)}
        alt={coverAltFor(post)}
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? undefined : "lazy"}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
      {/* Always-on caption: section + title in mono, over a gradient scrim. */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-foreground/90 via-foreground/45 to-transparent p-4 pt-12">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[color:var(--bg)]/75">
          {section}
        </span>
        <span className="mt-1 font-mono text-[0.82rem] font-medium uppercase leading-snug tracking-[0.08em] text-[color:var(--bg)]">
          {post.title}
        </span>
      </div>
    </Link>
  );
}

/** A mono list module: heading + rows (title + dateline). */
function ListModule({
  title,
  href,
  posts,
  numbered = false,
}: {
  title: string;
  href?: string;
  posts: Post[];
  numbered?: boolean;
}) {
  const Heading = href ? Link : "h2";
  return (
    <div>
      <Heading
        {...(href ? { href } : {})}
        className={`block border-b border-foreground pb-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-heading ${href ? "transition-colors hover:text-primary" : ""}`}
      >
        {title}
      </Heading>
      <ol className="mt-1 divide-y divide-border">
        {posts.map((p, i) => (
          <li key={p.id} className="group flex gap-3.5 py-3.5">
            {numbered && (
              <span className="font-mono text-base leading-none text-primary">
                {i + 1}
              </span>
            )}
            <div className="min-w-0">
              <Link
                href={`/posts/${p.slug}`}
                className="block font-mono text-[0.8rem] font-medium uppercase leading-snug tracking-[0.06em] text-heading transition-colors group-hover:text-primary"
              >
                {p.title}
              </Link>
              <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted">
                {formatDate(publishDate(p))}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function StarkHome({ posts }: { posts: Post[] }) {
  const sections = [...new Set(posts.map((p) => sectionFor(p)))];
  const mostRead = posts.slice(0, 5);
  const bySection = (name: string) =>
    posts.filter((p) => sectionFor(p) === name).slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Gallery grid. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {posts.map((post, i) => (
          <Tile key={post.id} post={post} priority={i < 4} />
        ))}
      </div>

      {/* List band: Most Read + per-section indexes. */}
      <section className="mt-16 border-t-2 border-foreground pt-10">
        <div className="grid gap-x-10 gap-y-12 md:grid-cols-3">
          <ListModule title="Most Read" posts={mostRead} numbered />
          {sections.slice(0, 2).map((name) => (
            <ListModule
              key={name}
              title={name}
              href={sectionHref(name)}
              posts={bySection(name)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

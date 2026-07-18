import Link from "next/link";
import type { Post } from "@/lib/letterbrace/types";
import { Cover } from "@/components/Story";
import { Kicker } from "@/components/Kicker";
import { PostMeta } from "@/components/PostMeta";

/**
 * Board front (a pinboard — wellness, food, DIY, lifestyle). A wide featured
 * card, then a Pinterest-style masonry of soft, rounded cards: most carry an
 * image, some are text-only "notes", all flow into balanced columns. Warm,
 * browsable and casual — a wall of ideas rather than a ranked feed.
 */
export function BoardHome({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts;

  return (
    <div className="container-wide px-6 py-8">
      {lead && (
        <section className="mb-8">
          <article className="group grid gap-5 rounded-[var(--radius)] border border-border bg-surface p-5 sm:grid-cols-2 sm:p-6">
            <Cover post={lead} ratio="4/3" priority className="sm:order-2" />
            <div className="flex flex-col justify-center gap-3 sm:order-1">
              <Kicker post={lead} />
              <Link href={`/posts/${lead.slug}`} className="headline-link">
                <h2 className="font-display text-3xl font-black leading-tight sm:text-4xl">
                  {lead.title}
                </h2>
              </Link>
              {lead.excerpt && (
                <p className="text-fg-soft excerpt-clamp-3">{lead.excerpt}</p>
              )}
              <PostMeta post={lead} variant="byline" readingTime className="mt-1" />
            </div>
          </article>
        </section>
      )}

      {rest.length > 0 && (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
          {rest.map((post, i) => {
            // Every third card is a text-only "note" for pinboard texture.
            const note = i % 3 === 1;
            return (
              <article
                key={post.id}
                className="group block break-inside-avoid overflow-hidden rounded-[var(--radius)] border border-border bg-surface"
              >
                {!note && (
                  <Cover
                    post={post}
                    ratio={i % 2 === 0 ? "4/5" : "3/2"}
                    rounded={false}
                  />
                )}
                <div className={`flex flex-col gap-2 p-4 ${note ? "py-6" : ""}`}>
                  <Kicker post={post} />
                  <Link href={`/posts/${post.slug}`} className="headline-link">
                    <h3
                      className={`font-heading font-bold leading-snug ${
                        note ? "text-xl" : "text-lg"
                      }`}
                    >
                      {post.title}
                    </h3>
                  </Link>
                  {post.excerpt && (
                    <p
                      className={`text-sm text-fg-soft ${
                        note ? "excerpt-clamp-4" : "excerpt-clamp-3"
                      }`}
                    >
                      {post.excerpt}
                    </p>
                  )}
                  <PostMeta post={post} className="mt-1 text-xs" />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

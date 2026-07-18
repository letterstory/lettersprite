import Link from "next/link";
import type { Post } from "@/lib/letterbrace/types";
import { publishDate } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { Cover, LeadStory } from "@/components/Story";
import { Kicker } from "@/components/Kicker";
import { PostMeta } from "@/components/PostMeta";

/**
 * Timeline front (an engineering blog / product changelog — Linear, Vercel,
 * Stripe release notes). A lead announcement, then every entry stacked down a
 * ruled rail with a dated marker, newest first: the page reads as a running log
 * of ships rather than a magazine. Structure comes from the rail and datelines.
 */
export function TimelineHome({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts;

  return (
    <div className="container-wide px-6 py-10">
      {lead && (
        <section
          className={`group grid gap-6 lg:grid-cols-2 lg:items-center ${
            rest.length > 0 ? "mb-12 border-b border-border pb-12" : ""
          }`}
        >
          <Cover post={lead} ratio="16/9" priority className="lg:order-2" />
          <div className="flex flex-col gap-3 lg:order-1">
            <Kicker post={lead} />
            <Link href={`/posts/${lead.slug}`} className="headline-link">
              <h2 className="display text-3xl font-black leading-[1.03] sm:text-4xl md:text-5xl">
                {lead.title}
              </h2>
            </Link>
            {lead.excerpt && (
              <p className="max-w-xl text-lg text-fg-soft excerpt-clamp-3">
                {lead.excerpt}
              </p>
            )}
            <PostMeta post={lead} variant="byline" readingTime className="mt-1" />
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <>
          <h2 className="rule-label mb-8">Changelog</h2>
          <div className="relative border-l border-border pl-8 sm:pl-10">
            {rest.map((post) => (
              <article key={post.id} className="group relative pb-12 last:pb-0">
                <span
                  className="absolute top-1.5 -left-8 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-primary ring-4 ring-background sm:-left-10"
                  aria-hidden
                />
                <time
                  dateTime={publishDate(post)}
                  className="kicker kicker-muted"
                >
                  {formatDate(publishDate(post))}
                </time>
                <div className="mt-2 grid gap-5 sm:grid-cols-[1fr_15rem] sm:items-start">
                  <div className="flex min-w-0 flex-col gap-2">
                    <Kicker post={post} />
                    <Link href={`/posts/${post.slug}`} className="headline-link">
                      <h3 className="font-display text-2xl font-bold leading-snug">
                        {post.title}
                      </h3>
                    </Link>
                    {post.excerpt && (
                      <p className="text-fg-soft excerpt-clamp-2">{post.excerpt}</p>
                    )}
                    <PostMeta post={post} readingTime className="mt-1 text-sm" />
                  </div>
                  <Cover post={post} ratio="16/9" className="sm:order-last" />
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

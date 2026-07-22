import Link from "next/link";
import type { Post } from "@/lib/letterbrace/types";
import { LeadStory } from "@/components/Story";
import { Kicker } from "@/components/Kicker";
import { PostMeta } from "@/components/PostMeta";
import { NewsletterCTA } from "@/components/NewsletterCTA";

/**
 * Digest front (a personal newsletter — Substack, a writer's dispatch). A quiet,
 * narrow reading column: one lead essay, then a numbered list of pieces with
 * roomy dividers, exactly the way an issue of an email newsletter reads. No
 * grid, no thumbnails competing for attention — just a considered running order.
 */
export function DigestHome({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts;

  return (
    <div className="container-content px-6 py-10">
      {lead && (
        <section className="mb-10 border-b border-border pb-10">
          <LeadStory post={lead} ratio="3/2" />
        </section>
      )}

      {rest.length > 0 && (
        <>
          <h2 className="rule-label mb-8">The Reading List</h2>
          <ol className="flex flex-col divide-y divide-border">
            {rest.map((post, i) => (
              <li
                key={post.id}
                className="group grid grid-cols-[auto_1fr] gap-5 py-7 first:pt-0"
              >
                <span className="font-display text-2xl font-black leading-none tabular-nums text-primary/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex min-w-0 flex-col gap-2">
                  <Kicker post={post} />
                  <Link href={`/posts/${post.slug}`} className="headline-link">
                    <h3 className="font-display text-2xl font-bold leading-snug">
                      {post.title}
                    </h3>
                  </Link>
                  {post.dek && (
                    <p className="text-fg-soft excerpt-clamp-2">{post.dek}</p>
                  )}
                  <PostMeta post={post} readingTime className="mt-1 text-sm" />
                </div>
              </li>
            ))}
          </ol>

          <NewsletterCTA variant="inline" className="mt-12" />
        </>
      )}
    </div>
  );
}

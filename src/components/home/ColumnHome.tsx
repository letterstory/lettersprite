import Link from "next/link";
import type { Post } from "@/lib/letterbrace/types";
import { Cover, LeadStory } from "@/components/Story";
import { Kicker } from "@/components/Kicker";
import { PostMeta } from "@/components/PostMeta";

/**
 * Column front (The Atlantic / Slate). A restrained, generous single column: a
 * lead essay, then a stack of large stories with wide imagery, roomy spacing and
 * hairline dividers. Longform, considered, quiet — the opposite of a busy grid.
 */
export function ColumnHome({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts;

  return (
    <div className="container-content px-6 py-10">
      {lead && (
        <section className="mb-10 border-b border-border pb-12">
          <LeadStory post={lead} ratio="3/2" />
        </section>
      )}

      <div className="flex flex-col divide-y divide-border">
        {rest.map((post) => (
          <article key={post.id} className="group grid gap-6 py-10 sm:grid-cols-[1fr_15rem]">
            <div className="flex flex-col gap-3 sm:order-1">
              <Kicker post={post} />
              <Link href={`/posts/${post.slug}`} className="headline-link">
                <h2 className="font-display text-2xl font-bold leading-tight sm:text-[1.7rem]">
                  {post.title}
                </h2>
              </Link>
              {post.dek && (
                <p className="text-fg-soft excerpt-clamp-3">{post.dek}</p>
              )}
              <PostMeta post={post} readingTime className="mt-1 text-sm" />
            </div>
            <Cover
              post={post}
              ratio="4/3"
              className="sm:order-2 sm:self-start"
            />
          </article>
        ))}
      </div>
    </div>
  );
}

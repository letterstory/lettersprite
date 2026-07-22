import type { Post } from "@/lib/letterbrace/types";
import { StoryCard } from "@/components/Story";
import { Cover } from "@/components/Story";
import { Kicker } from "@/components/Kicker";
import { PostMeta } from "@/components/PostMeta";
import Link from "next/link";

/**
 * Mosaic front (New York Magazine / The Cut). A bold, asymmetric grid: an
 * oversized lead spanning two columns beside a stacked pair, then a rhythm of
 * portrait and landscape cards. Loud display headlines, tight leading, lots of
 * contrast between big and small.
 */
export function MosaicHome({ posts }: { posts: Post[] }) {
  const [lead, second, third, ...rest] = posts;

  return (
    <div className="container-wide px-6 py-8">
      {/* Hero band: big lead + two stacked features */}
      <section className="grid gap-8 lg:grid-cols-3">
        {lead && (
          <div className="group flex flex-col gap-4 lg:col-span-2">
            <Cover post={lead} ratio="16/9" priority />
            <div className="flex flex-col gap-3">
              <Kicker post={lead} />
              <Link href={`/posts/${lead.slug}`} className="headline-link">
                <h2 className="display text-4xl font-black leading-[0.98] sm:text-5xl md:text-6xl">
                  {lead.title}
                </h2>
              </Link>
              {lead.dek && (
                <p className="max-w-2xl text-lg text-fg-soft excerpt-clamp-3">
                  {lead.dek}
                </p>
              )}
              <PostMeta post={lead} variant="byline" readingTime className="mt-1" />
            </div>
          </div>
        )}
        <div className="flex flex-col divide-y divide-border">
          {[second, third].filter(Boolean).map((post) => (
            <div key={post.id} className="py-6 first:pt-0">
              <StoryCard post={post} size="md" ratio="3/2" dek />
            </div>
          ))}
        </div>
      </section>

      {rest.length > 0 && (
        <>
          <h2 className="rule-label my-9">The Feed</h2>
          {/* Alternating portrait/landscape cards for a magazine rhythm. */}
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {rest.map((post, i) => (
              <StoryCard
                key={post.id}
                post={post}
                size={i % 5 === 0 ? "md" : "sm"}
                ratio={i % 3 === 0 ? "4/5" : "4/3"}
                dek={i % 5 === 0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

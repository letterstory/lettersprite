import Link from "next/link";
import type { Post } from "@/lib/letterbrace/types";
import { coverImageFor } from "@/lib/covers";
import { StoryCard } from "@/components/Story";
import { Kicker } from "@/components/Kicker";

/**
 * Cover front (Vogue / Vanity Fair). The lead runs as a full-bleed *magazine
 * cover*: a towering image with the masthead-scale headline overlaid bottom-left
 * and a stack of "coverlines" (teasers for other features) tucked top-right —
 * then a restrained "In This Issue" grid beneath. Made for fashion, beauty and
 * culture titles where the front page is a statement, not a feed.
 */
export function CoverHome({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts;
  // The first few are teased as "coverlines" over the image on desktop; the
  // full remainder always fills the "In This Issue" grid so every story stays
  // reachable at every breakpoint (the coverlines are a desktop re-surfacing).
  const coverlines = rest.slice(0, 3);
  const issue = rest;

  return (
    <div>
      {lead && (
        <section className="relative">
          <Link
            href={`/posts/${lead.slug}`}
            aria-hidden
            tabIndex={-1}
            className="block overflow-hidden"
          >
            <img
              src={coverImageFor(lead)}
              alt=""
              className="h-[86vh] max-h-[900px] min-h-[520px] w-full object-cover"
            />
          </Link>
          <div className="hero-tint pointer-events-none absolute inset-0" />
          <div className="absolute inset-0 flex flex-col justify-between">
            {/* Coverlines — teasers, upper right, like a newsstand cover. */}
            {coverlines.length > 0 && (
              <div className="container-wide flex justify-end px-6 pt-8 sm:pt-10">
                <ul className="hidden max-w-[16rem] flex-col items-end gap-3 text-right sm:flex">
                  {coverlines.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/posts/${post.slug}`}
                        className="font-heading text-sm font-semibold uppercase leading-tight tracking-wide text-white/85 transition-colors hover:text-white"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* The cover headline. */}
            <div className="container-wide px-6 pb-10 text-white sm:pb-16">
              <Kicker post={lead} className="text-white/90" linked={false} />
              <Link href={`/posts/${lead.slug}`}>
                <h2 className="display mt-3 max-w-3xl text-5xl font-black leading-[0.92] drop-shadow-sm sm:text-6xl md:text-7xl">
                  {lead.title}
                </h2>
              </Link>
              {lead.excerpt && (
                <p className="mt-4 max-w-xl text-lg text-white/85 excerpt-clamp-2">
                  {lead.excerpt}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {issue.length > 0 && (
        <div className="container-wide px-6 py-12">
          <h2 className="rule-label mb-8">In This Issue</h2>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {issue.map((post) => (
              <StoryCard key={post.id} post={post} size="md" ratio="4/5" excerpt />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

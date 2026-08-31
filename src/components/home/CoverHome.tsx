import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { coverAltFor, coverImageFor } from "@/lib/covers";
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
  //
  // These are TEASES, not headlines — on a real cover they run three or four
  // words. Ours are whole titles set in uppercase inside a 16rem rail, so an
  // unbounded one ran to five lines and three of them turned the top-right of
  // the cover into a wall of capitals. They are clamped to two lines below.
  const coverlines = rest.slice(0, 3);
  const issue = rest;

  return (
    <div>
      {/*
        The cover: the image and the overlay share ONE grid cell, so the section
        is as tall as whichever is taller.

        It used to be a fixed-height image with an `absolute inset-0` overlay,
        which gave the cover headline a hard ceiling it silently broke through:
        at 1280x800 — an ordinary laptop — the kicker + a three-line 72px
        headline + the dek came to 718px inside a 688px hero and spilled past
        the bottom of the image, so the headline read as cut off. The height
        target is unchanged (86vh, capped at 900, floored at 520); it is simply
        a MINIMUM now rather than a fixed size.
      */}
      {lead && (
        <section className="relative grid min-h-[max(520px,min(86vh,900px))] grid-cols-1 grid-rows-1">
          <Link
            href={`/posts/${lead.slug}`}
            aria-hidden
            tabIndex={-1}
            className="col-start-1 row-start-1 block overflow-hidden"
          >
            <img
              src={coverImageFor(lead, 1600)}
              alt={coverAltFor(lead)}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </Link>
          <div className="hero-tint pointer-events-none col-start-1 row-start-1" />
          <div className="col-start-1 row-start-1 flex flex-col justify-between">
            {/* Coverlines — teasers, upper right, like a newsstand cover. */}
            {coverlines.length > 0 && (
              <div className="container-wide flex justify-end px-6 pt-8 sm:pt-10">
                <ul className="hidden max-w-[16rem] flex-col items-end gap-3 text-right sm:flex">
                  {coverlines.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/posts/${post.slug}`}
                        className="line-clamp-2 font-heading text-sm font-semibold uppercase leading-tight tracking-wide text-white/85 transition-colors hover:text-white"
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
                <h2 className="display mt-3 line-clamp-3 max-w-3xl text-5xl font-black leading-[0.92] text-white [text-shadow:0_1px_16px_rgba(0,0,0,0.45)] sm:text-6xl md:text-7xl">
                  {lead.title}
                </h2>
              </Link>
              {lead.dek && (
                <p className="mt-4 max-w-xl text-lg text-white/85 excerpt-clamp-3">
                  {lead.dek}
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
              <StoryCard key={post.id} post={post} size="md" ratio="3/2" dek />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { env } from "@/env";
import type { Post } from "@/lib/letterbrace/types";
import { coverImageFor } from "@/lib/covers";
import { StoryCard } from "@/components/Story";
import { Kicker } from "@/components/Kicker";

/**
 * Glossy front (The Verge / Wired). A cinematic full-bleed hero with the
 * headline set over the image and a gradient scrim, then a bold, even card grid.
 * The most "designed", high-contrast layout — big imagery, vivid accents.
 */
export function GlossyHome({ posts }: { posts: Post[] }) {
  const [lead, second, third, ...rest] = posts;
  const secondaryFeatures = [second, third].filter(Boolean);

  return (
    <div>
      {lead && (
        <section className="group relative">
          <Link
            href={`/posts/${lead.slug}`}
            aria-hidden
            tabIndex={-1}
            className="block overflow-hidden"
          >
            <img
              src={coverImageFor(lead)}
              alt=""
              className="h-[52vh] max-h-[560px] min-h-[380px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </Link>
          <div className="hero-tint pointer-events-none absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="container-wide px-6 pb-8 sm:pb-12">
              <div className="max-w-3xl text-white">
                <Kicker post={lead} className="text-white/90" linked={false} />
                <Link href={`/posts/${lead.slug}`}>
                  <h2 className="display mt-3 text-4xl font-black leading-[1.02] drop-shadow-sm sm:text-5xl md:text-6xl">
                    {lead.title}
                  </h2>
                </Link>
                {lead.excerpt && (
                  <p className="mt-3 max-w-xl text-lg text-white/85 excerpt-clamp-2">
                    {lead.excerpt}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="container-wide px-6 py-12">
        {secondaryFeatures.length > 0 && (
          <section className="mb-12 grid gap-8 border-b border-border pb-12 sm:grid-cols-2">
            {secondaryFeatures.map((post) => (
              <StoryCard key={post.id} post={post} size="lg" ratio="16/9" excerpt />
            ))}
          </section>
        )}

        {rest.length > 0 && (
          <>
            <h2 className="rule-label mb-8">More From {env.siteTitle}</h2>
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <StoryCard key={post.id} post={post} size="md" ratio="16/9" excerpt />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

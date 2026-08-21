import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { Cover, StoryCard } from "@/components/Story";
import { Kicker } from "@/components/Kicker";
import { PostMeta } from "@/components/PostMeta";

/**
 * Atlantic-style front: a symmetric three-column page — image cards plus a
 * numbered "Most Read" list on the left, a big centered hero with secondary
 * stories in the middle, and a text-with-thumbnail rail on the right — then a
 * wide card grid below. Restrained, serif, magazine-of-record.
 *
 * Headlines use `font-display` (the theme's serif); the "Most Read" heading and
 * kickers use the sans heading font via the shared `.kicker`/`font-heading`
 * treatment, so the whole layout follows the active theme's fonts.
 */
export function AtlanticHome({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts;
  const leftCards = rest.slice(0, 2);
  const mostRead = rest.slice(2, 7);
  const centerSub = rest.slice(7, 10);
  const rightList = rest.slice(10, 15);
  const below = rest.slice(15, 23);

  return (
    <div className="container-wide px-6 py-8">
      <section className="grid gap-8 lg:grid-cols-12">
        {/* Left — stacked image cards, then a numbered "Most Read" list. */}
        <div className="flex flex-col lg:col-span-3 lg:border-r lg:border-border lg:pr-8">
          <div className="flex flex-col divide-y divide-border">
            {leftCards.map((p) => (
              <div key={p.id} className="py-7 first:pt-0">
                <StoryCard post={p} size="sm" ratio="16/9" dek={false} />
              </div>
            ))}
          </div>
          {mostRead.length > 0 && (
            <div className="mt-7 border-t-2 border-foreground pt-5">
              <h2 className="kicker mb-4">Most Read</h2>
              <ol className="flex flex-col divide-y divide-border">
                {mostRead.map((p, i) => (
                  <li
                    key={p.id}
                    className="group flex items-baseline gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="font-display text-2xl font-bold leading-none text-primary/70">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <Link href={`/posts/${p.slug}`}>
                        <h3 className="font-display text-base font-semibold leading-snug text-heading transition-colors group-hover:text-primary">
                          {p.title}
                        </h3>
                      </Link>
                      <div className="mt-1">
                        <PostMeta post={p} className="text-xs" />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Center — big centered hero, then secondary stories to fill the column. */}
        <div className="lg:col-span-6 lg:px-4">
          {lead && (
            <article className="group text-center">
              <Cover post={lead} ratio="16/9" priority />
              <div className="mx-auto mt-6 max-w-2xl">
                <Kicker post={lead} className="justify-center" />
                <Link href={`/posts/${lead.slug}`}>
                  <h2 className="mt-3 font-display text-3xl font-bold leading-[1.12] text-heading text-balance sm:text-[2.6rem]">
                    {lead.title}
                  </h2>
                </Link>
                {lead.dek && (
                  <p className="mt-4 text-lg leading-relaxed text-fg-soft text-pretty">
                    {lead.dek}
                  </p>
                )}
                <div className="mt-4 flex justify-center">
                  <PostMeta post={lead} className="text-xs" />
                </div>
              </div>
            </article>
          )}

          {centerSub.length > 0 && (
            <div className="mt-8 flex flex-col divide-y divide-border border-t-2 border-foreground pt-6">
              {centerSub.map((p) => (
                <article
                  key={p.id}
                  className="group flex items-start gap-5 py-5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <Kicker post={p} />
                    <Link href={`/posts/${p.slug}`}>
                      <h3 className="mt-1.5 font-display text-xl font-bold leading-snug text-heading text-balance transition-colors group-hover:text-primary">
                        {p.title}
                      </h3>
                    </Link>
                    {p.dek && (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-fg-soft">
                        {p.dek}
                      </p>
                    )}
                    <div className="mt-2">
                      <PostMeta post={p} className="text-xs" />
                    </div>
                  </div>
                  <Cover post={p} ratio="4/3" className="w-32 shrink-0 sm:w-40" />
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Right — text + thumbnail rail. */}
        <div className="flex flex-col divide-y divide-border lg:col-span-3 lg:border-l lg:border-border lg:pl-8">
          {rightList.map((p) => (
            <article
              key={p.id}
              className="group flex items-start gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <Link href={`/posts/${p.slug}`}>
                  <h3 className="font-display text-lg font-semibold leading-snug text-heading transition-colors group-hover:text-primary">
                    {p.title}
                  </h3>
                </Link>
                <div className="mt-1.5">
                  <PostMeta post={p} className="text-xs" />
                </div>
              </div>
              <Cover post={p} ratio="1/1" className="w-16 shrink-0 sm:w-20" />
            </article>
          ))}
        </div>
      </section>

      {below.length > 0 && (
        <>
          <div className="my-10 border-t-2 border-foreground" />
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {below.map((p) => (
              <StoryCard key={p.id} post={p} size="sm" ratio="16/9" dek={false} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

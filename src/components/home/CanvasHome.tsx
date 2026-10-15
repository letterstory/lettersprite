import Link from "@/components/Link";
import { env } from "@/env";
import { PostMeta } from "@/components/PostMeta";
import type { Post } from "@/lib/letterbrace/types";
import { sectionFor, sectionHref } from "@/lib/editorial";
import { coverAltFor, coverImageFor } from "@/lib/covers";

/**
 * Canvas front — a take on glideapps.com/blog ("The Column"): a centered hero
 * title + standfirst + inline subscribe field, a lead card spanning the full
 * width, then a clean 1/2/3-column grid of rounded 16:9 cards with a circular
 * author avatar + name + date in the meta row. No ads, no rails — a calm
 * product blog.
 */

function Kicker({ post }: { post: Post }) {
  const s = sectionFor(post);
  return (
    <Link
      href={sectionHref(s)}
      className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-kicker transition-opacity hover:opacity-70"
    >
      {s}
    </Link>
  );
}

function Cover({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="block overflow-hidden rounded-[var(--radius)] bg-surfaceAlt"
      style={{ aspectRatio: "16/9" }}
    >
      <img
        src={coverImageFor(post, priority ? 1200 : 700)}
        alt={coverAltFor(post)}
        loading={priority ? undefined : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </Link>
  );
}

/** The dominant lead post: full-width cover, large title, byline row. */
function Lead({ post }: { post: Post }) {
  return (
    <article className="group container-wide px-6">
      <Cover post={post} priority />
      <div className="mx-auto mt-6 max-w-3xl text-center">
        <Kicker post={post} />
        <Link href={`/posts/${post.slug}`}>
          <h2 className="mt-3 font-display text-3xl font-bold leading-[1.08] tracking-[-0.01em] text-heading text-balance transition-colors group-hover:text-primary sm:text-4xl">
            {post.title}
          </h2>
        </Link>
        {post.dek && (
          <p className="mx-auto mt-3 max-w-xl text-lg leading-relaxed text-fg-soft">
            {post.dek}
          </p>
        )}
        <div className="mt-5 flex justify-center">
          <PostMeta post={post} variant="byline" readingTime linkAuthor />
        </div>
      </div>
    </article>
  );
}

/** A uniform grid card: cover, kicker, title, dek, byline. */
function GridCard({ post }: { post: Post }) {
  return (
    <article className="group flex flex-col">
      <Cover post={post} />
      <div className="mt-4 flex flex-1 flex-col">
        <Kicker post={post} />
        <Link href={`/posts/${post.slug}`}>
          <h3 className="mt-2 font-display text-xl font-bold leading-snug tracking-[-0.01em] text-heading text-balance transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>
        {post.dek && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-fg-soft">
            {post.dek}
          </p>
        )}
        <div className="mt-auto pt-4">
          <PostMeta post={post} variant="byline" linkAuthor />
        </div>
      </div>
    </article>
  );
}

function SubscribeField() {
  if (!env.newsletterEnabled) return null;
  return (
    <form
      action={env.newsletterAction || undefined}
      method={env.newsletterAction ? "post" : undefined}
      className="mx-auto mt-8 flex w-full max-w-sm items-center gap-0 rounded-full border border-border bg-surface p-1.5"
    >
      <label htmlFor="canvas-email" className="sr-only">
        Email address
      </label>
      <input
        id="canvas-email"
        name="email"
        type="email"
        required
        placeholder="you@company.com"
        className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 whitespace-nowrap rounded-full bg-primary px-5 py-2 text-sm font-semibold text-[color:var(--primary-fg)] transition-opacity hover:opacity-90"
      >
        Subscribe
      </button>
    </form>
  );
}

function Hero() {
  return (
    <div className="container-wide px-6 pb-14 pt-16 text-center sm:pt-20">
      <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.02em] text-heading sm:text-6xl lg:text-7xl">
        {env.siteTitle}
      </h1>
      {env.siteTagline && (
        <p className="mx-auto mt-4 max-w-xl text-xl text-fg-soft">
          {env.siteTagline}
        </p>
      )}
      <SubscribeField />
    </div>
  );
}

export function CanvasHome({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts;
  const grid = rest.slice(0, 11);

  return (
    <div>
      <Hero />

      {lead && (
        <div className="pb-16">
          <Lead post={lead} />
        </div>
      )}

      {grid.length > 0 && (
        <section className="container-wide px-6 pb-20">
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {grid.map((p) => (
              <GridCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

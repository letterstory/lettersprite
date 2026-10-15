import Link from "@/components/Link";
import { env } from "@/env";
import { PostMeta } from "@/components/PostMeta";
import type { Post } from "@/lib/letterbrace/types";
import {
  allSections,
  sectionHref,
  sectionSlug,
  postsInSection,
} from "@/lib/editorial";
import { coverAltFor, coverImageFor } from "@/lib/covers";

/**
 * Canvas front — a 1:1 structural clone of glideapps.com/blog ("The Column"),
 * rebuilt from measured computed styles (see design-ref/glide-tokens.json):
 * a left-aligned editorial masthead (title + dek + subscribe field), a
 * hero-image + ~5-story list row, one large featured lead card + "Read All
 * Posts", a "Browse by section" pill row, then a full-coverage river per real
 * claimscurrent section (every section with posts gets one — cycling 3-up
 * grid / lead+list / 6-card grid, the way Glide alternates its own category
 * fronts), a two-up "Keep Reading" band for the two smallest sections, and
 * the shared newsletter band + footer below. No ads, no invented copy — a
 * section with no posts is skipped outright.
 */

function GhostPill({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[color:var(--surface)]"
    >
      {children}
    </Link>
  );
}

function Cover({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="block overflow-hidden rounded-[0.5rem] bg-surfaceAlt"
      style={{ aspectRatio: "16/9" }}
    >
      <img
        src={coverImageFor(post, priority ? 1200 : 700)}
        alt={coverAltFor(post)}
        loading={priority ? undefined : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
    </Link>
  );
}

/** The left-aligned masthead block: huge title, one-line dek, subscribe field. */
function Masthead() {
  return (
    <div className="max-w-[960px]">
      <h1 className="text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.02em] text-heading sm:text-6xl sm:tracking-[-0.03em] lg:text-7xl lg:leading-[1.05] lg:tracking-[-0.035em] xl:text-[5.3rem]">
        {env.siteTitle}
      </h1>
      {env.siteTagline && (
        <h2 className="mt-4 max-w-2xl text-xl font-normal leading-snug text-muted">
          {env.siteTagline}
        </h2>
      )}
      {env.newsletterEnabled && (
        <form
          action={env.newsletterAction || undefined}
          method={env.newsletterAction ? "post" : undefined}
          className="mt-8 w-full sm:w-[365px]"
        >
          <div className="flex w-full items-center gap-0 rounded-xl border border-border bg-background p-2">
            <label htmlFor="canvas-email" className="sr-only">
              Email address
            </label>
            <input
              id="canvas-email"
              name="email"
              type="email"
              required
              placeholder="Enter email address"
              className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1 text-foreground placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 whitespace-nowrap rounded-full bg-[color:var(--surface-alt)] px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[color:var(--border)]"
            >
              Subscribe
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/** A compact list beside the hero image: thumbnail + title + one-line dek. */
function LatestList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <ul className="flex w-full flex-col divide-y divide-border lg:max-w-sm">
      {posts.map((p) => (
        <li key={p.id} className="py-5 first:pt-0">
          <div className="group flex gap-4">
            <Link
              href={`/posts/${p.slug}`}
              className="block w-24 shrink-0 overflow-hidden rounded-[0.5rem] bg-surfaceAlt"
              style={{ aspectRatio: "16/9" }}
            >
              <img
                src={coverImageFor(p, 300)}
                alt={coverAltFor(p)}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </Link>
            <div className="min-w-0">
              <Link href={`/posts/${p.slug}`}>
                <h3 className="text-[0.95rem] font-semibold leading-snug text-heading transition-colors group-hover:text-primary">
                  {p.title}
                </h3>
              </Link>
              {p.dek && (
                <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted">
                  {p.dek}
                </p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** The single large featured card below the masthead row. */
function FeaturedCard({ post }: { post: Post }) {
  return (
    <article className="group">
      <Cover post={post} priority />
      <div className="mt-5">
        <Link href={`/posts/${post.slug}`}>
          <p className="text-3xl font-semibold leading-[1.1] tracking-[-0.015em] text-heading transition-colors group-hover:text-primary lg:text-4xl">
            {post.title}
          </p>
        </Link>
        <div className="mt-3">
          <PostMeta post={post} variant="byline" linkAuthor />
        </div>
      </div>
    </article>
  );
}

/** A 3-up grid card: cover, title, byline. No kickers, no deks — Glide's grid cards carry no dek. */
function GridCard({ post }: { post: Post }) {
  return (
    <article className="group flex flex-col">
      <Cover post={post} />
      <div className="mt-4">
        <Link href={`/posts/${post.slug}`}>
          <p className="text-xl font-semibold leading-snug text-heading transition-colors group-hover:text-primary">
            {post.title}
          </p>
        </Link>
        <div className="mt-2.5">
          <PostMeta post={post} variant="byline" linkAuthor />
        </div>
      </div>
    </article>
  );
}

/** A small list row (thumbnail + title + dek) used beside the big image in the "image + list" pattern. */
function MiniRow({ post }: { post: Post }) {
  return (
    <div className="group flex gap-4 py-4 first:pt-0">
      <Link
        href={`/posts/${post.slug}`}
        className="block w-24 shrink-0 overflow-hidden rounded-[0.5rem] bg-surfaceAlt"
        style={{ aspectRatio: "16/9" }}
      >
        <img
          src={coverImageFor(post, 300)}
          alt={coverAltFor(post)}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </Link>
      <div className="min-w-0">
        <Link href={`/posts/${post.slug}`}>
          <p className="text-[0.95rem] font-semibold leading-snug text-heading transition-colors group-hover:text-primary">
            {post.title}
          </p>
        </Link>
        {post.dek && (
          <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted">
            {post.dek}
          </p>
        )}
      </div>
    </div>
  );
}

/** Section header: big black H2 + "Read More" ghost pill, no dek (none in source data). */
function SectionHeading({ name }: { name: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
      <h2 className="text-4xl font-semibold tracking-[-0.015em] text-heading sm:text-5xl lg:text-[3.75rem]">
        {name}
      </h2>
      <GhostPill href={sectionHref(name)}>
        Read More <span aria-hidden>→</span>
      </GhostPill>
    </div>
  );
}

/** Alternating section layout A: a 3-up card grid. */
function GridSection({
  name,
  posts,
  count = 3,
}: {
  name: string;
  posts: Post[];
  count?: number;
}) {
  const items = posts.slice(0, count);
  return (
    <section className="container-wide px-4 py-16 xl:px-10 lg:py-20">
      <SectionHeading name={name} />
      <div className="grid gap-x-4 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-[4.5rem]">
        {items.map((p) => (
          <GridCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}

/** Alternating section layout B: one big image left, a mini list (~5) right. */
function ImageListSection({ name, posts }: { name: string; posts: Post[] }) {
  const [lead, ...rest] = posts;
  if (!lead) return null;
  const mini = rest.slice(0, 5);
  return (
    <section className="container-wide px-4 py-16 xl:px-10 lg:py-20">
      <SectionHeading name={name} />
      <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <FeaturedCard post={lead} />
        {mini.length > 0 && (
          <div>
            <div className="divide-y divide-border lg:border-l lg:border-border lg:pl-10">
              {mini.map((p) => (
                <MiniRow key={p.id} post={p} />
              ))}
            </div>
            <div className="mt-2 lg:border-l lg:border-border lg:pl-10">
              <GhostPill href={sectionHref(name)}>Read All Posts</GhostPill>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** "Keep Reading {section}" — a small boxed list, no images. */
function KeepReadingBox({ name, posts }: { name: string; posts: Post[] }) {
  const items = posts.slice(0, 4);
  if (items.length === 0) return null;
  return (
    <div className="rounded-[0.5rem] bg-[color:var(--surface)] p-6 sm:p-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-heading">
          Keep Reading <span className="font-normal text-muted">{name}</span>
        </h3>
        <Link
          href={sectionHref(name)}
          className="shrink-0 text-sm font-medium text-primary transition-opacity hover:opacity-70"
        >
          Read More
        </Link>
      </div>
      <ul className="flex flex-col divide-y divide-border">
        {items.map((p) => (
          <li key={p.id} className="py-3 first:pt-0">
            <Link href={`/posts/${p.slug}`} className="group block">
              <p className="text-sm font-semibold leading-snug text-heading transition-colors group-hover:text-primary">
                {p.title}
              </p>
              {p.dek && (
                <p className="mt-1 line-clamp-1 text-xs text-muted">{p.dek}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * LOCAL PREVIEW ONLY — delete this block before the canvas theme PR ships.
 * Glide's own reference imagery, for direct visual comparison while building.
 * Named slots so real assets (or none) can be swapped in before shipping:
 *   - heroImage: the dark product-screenshot graphic beside the masthead.
 * Gated on NODE_ENV so it can never render in a production build even if this
 * block isn't stripped in time. Source files: design-ref/glide-images/
 * (gitignored, never committed, never used by any production code path).
 */
const LOCAL_PREVIEW_IMAGES: { heroImage?: string } =
  process.env.NODE_ENV !== "production"
    ? { heroImage: "/_local-preview/glide-hero-screenshot.png" }
    : {};

export function CanvasHome({ posts }: { posts: Post[] }) {
  const sections = allSections(posts);
  const [hero, ...rest] = posts;
  const latestForHero = rest.filter(Boolean).slice(0, 5);

  // One river per section, most-populated first (allSections' own order).
  // The top sections become full rivers (every one, not just a handful); the
  // smallest two go in the compact "Keep Reading" band instead — mirroring
  // Glide's own split (6 big category fronts + 2 small Keep Reading boxes).
  const sectionBlocks = sections
    .map((name) => ({
      name,
      posts: postsInSection(posts, sectionSlug(name)),
    }))
    .filter((b) => b.posts.length > 0);

  const keepReading = sectionBlocks.slice(-2);
  const rivers = sectionBlocks.slice(0, Math.max(sectionBlocks.length - 2, 0));

  return (
    <div>
      {hero && (
        <div className="container-wide px-4 pb-10 pt-14 xl:px-10 lg:pt-20">
          <Masthead />
        </div>
      )}

      {hero && (
        <div className="container-wide px-4 pb-16 xl:px-10 lg:pb-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
            {LOCAL_PREVIEW_IMAGES.heroImage ? (
              <img
                src={LOCAL_PREVIEW_IMAGES.heroImage}
                alt=""
                aria-hidden
                className="w-full rounded-[0.5rem] object-cover"
                style={{ aspectRatio: "16/9" }}
              />
            ) : (
              <div />
            )}
            <div>
              <LatestList posts={latestForHero} />
              <div className="mt-2">
                <GhostPill href="/latest">Read All Posts</GhostPill>
              </div>
            </div>
          </div>
        </div>
      )}

      {hero && (
        <div className="container-wide px-4 pb-16 xl:px-10 lg:pb-20">
          <FeaturedCard post={hero} />
        </div>
      )}

      {sections.length > 0 && (
        <nav
          aria-label="Browse by section"
          className="swipe-x border-y border-border"
        >
          <div className="container-wide flex w-max items-center gap-3 px-4 py-5 xl:px-10 lg:w-full lg:flex-wrap">
            <span className="kicker shrink-0 pr-2">Browse by section</span>
            <GhostPill href="/latest">Latest</GhostPill>
            {sections.map((s) => (
              <GhostPill key={s} href={sectionHref(s)}>
                {s}
              </GhostPill>
            ))}
          </div>
        </nav>
      )}

      {rivers.map((block, i) => {
        const variant = i % 3; // 0: 3-up grid, 1: lead + list, 2: 6-card grid
        if (variant === 0) {
          return <GridSection key={block.name} name={block.name} posts={block.posts} count={3} />;
        }
        if (variant === 1) {
          return <ImageListSection key={block.name} name={block.name} posts={block.posts} />;
        }
        return <GridSection key={block.name} name={block.name} posts={block.posts} count={6} />;
      })}

      {keepReading.length > 0 && (
        <section className="container-wide px-4 pb-20 xl:px-10">
          <div className="grid gap-6 sm:grid-cols-2">
            {keepReading.map((b) => (
              <KeepReadingBox key={b.name} name={b.name} posts={b.posts} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

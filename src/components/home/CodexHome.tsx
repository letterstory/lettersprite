import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import {
  allSections,
  sectionHref,
  sectionSlug,
  postsInSection,
  publishDate,
  sectionFor,
} from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { bylineFor } from "@/lib/author";
import { coverAltFor, coverImageFor } from "@/lib/covers";
import { env } from "@/env";

/**
 * Codex front — a structural clone of every.to's actual homepage: solid
 * black, white text, a top block (two small stacked items + one dominant
 * illustrated feature + a "Recent Essays" list), then a river of square-grid
 * "Dispatches from ..." sections, one per real section with posts. Article
 * pages stay on the theme's cream palette — only the home template flips to
 * black, scoped via local CSS-var overrides (`--bg`/`--fg`/`--muted`/etc.),
 * matching every.to's own home-is-dark/article-is-light split.
 */

const DARK_VARS = {
  "--bg": "#000000",
  "--surface": "#0a0a0a",
  "--surface-alt": "#171717",
  "--fg": "#ffffff",
  "--muted": "rgba(255,255,255,0.6)",
  "--border": "#2e2e2e",
  "--heading-color": "#ffffff",
  "--kicker": "rgba(255,255,255,0.6)",
  "--link": "#ffffff",
} as React.CSSProperties;

/** "OCT 19, 2026 IN PLAYTESTING" — every.to's small-item eyebrow. */
function dateInSection(post: Post): string {
  const iso = publishDate(post);
  const date = iso ? formatDate(iso).toUpperCase() : null;
  const section = sectionFor(post);
  if (date && section) return `${date} IN ${section.toUpperCase()}`;
  return date ?? section.toUpperCase();
}

/** Avatar chip + caps author name — every.to's compact byline, no date/role. */
function AuthorCaption({ post }: { post: Post }) {
  const byline = bylineFor(post);
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="avatar h-6 w-6 text-[0.6rem]"
        style={{ backgroundColor: byline.color }}
        aria-hidden
      >
        {byline.initials}
      </span>
      <span className="text-xs font-bold uppercase tracking-wide text-heading">
        {byline.name}
      </span>
    </div>
  );
}

/**
 * A dark promo band — every.to's "What comes After automation?" conference
 * teaser, structurally: italic-swash serif headline, dek, filled + outline
 * pill buttons, a colorful graphic beside it. No invented event/product —
 * preauthreview has neither, so this promotes the newsletter + section
 * index using the site's own real tagline and sections instead.
 */
function PromoBand({ posts }: { posts: Post[] }) {
  const sections = allSections(posts);
  const art = posts[0];
  return (
    <section className="border-b border-border bg-surface px-4 py-10 xl:px-10 lg:py-14">
      <div className="container-wide grid items-center gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
        <div>
          <h2 className="font-display text-3xl font-normal leading-tight text-heading sm:text-4xl">
            Stay ahead of <em className="italic">denials</em>.
          </h2>
          {env.siteTagline && (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
              {env.siteTagline}
              {sections.length > 0 && (
                <> Covering {sections.join(", ").toLowerCase()}.</>
              )}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="#newsletter"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              Subscribe <span aria-hidden>↗</span>
            </Link>
            {sections[0] && (
              <Link
                href={sectionHref(sections[0])}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-white/5"
              >
                Browse sections <span aria-hidden>↗</span>
              </Link>
            )}
          </div>
        </div>
        {art && (
          <Link
            href={`/posts/${art.slug}`}
            className="block overflow-hidden rounded-[0.375rem]"
            style={{ aspectRatio: "16/9" }}
          >
            <img
              src={coverImageFor(art, 900)}
              alt={coverAltFor(art)}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </Link>
        )}
      </div>
    </section>
  );
}

function Thumb({
  post,
  priority = false,
  square = false,
}: {
  post: Post;
  priority?: boolean;
  square?: boolean;
}) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="block shrink-0 overflow-hidden rounded-[0.375rem] bg-surfaceAlt"
      style={{ aspectRatio: square ? "1/1" : "16/9" }}
    >
      <img
        src={coverImageFor(post, priority ? 1200 : 500)}
        alt={coverAltFor(post)}
        loading={priority ? undefined : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </Link>
  );
}

/** A small stacked item in the top-left column: thumbnail, eyebrow, title, byline. */
function SmallItem({ post }: { post: Post }) {
  return (
    <article className="group">
      <Thumb post={post} />
      <p className="mt-3 font-mono text-xs font-medium uppercase tracking-wide text-muted">
        {dateInSection(post)}
      </p>
      <Link href={`/posts/${post.slug}`}>
        <p className="mt-1.5 font-display text-lg font-normal leading-snug text-heading transition-colors group-hover:text-white/80">
          {post.title}
        </p>
      </Link>
      <div className="mt-2.5">
        <AuthorCaption post={post} />
      </div>
    </article>
  );
}

/** The dominant centered illustrated feature in the top block. */
function TopFeature({ post }: { post: Post }) {
  const iso = publishDate(post);
  return (
    <article className="group">
      <Thumb post={post} priority />
      {iso && (
        <p className="mt-4 text-center font-mono text-xs font-semibold uppercase tracking-wide text-muted">
          {formatDate(iso).toUpperCase()}
        </p>
      )}
      <Link href={`/posts/${post.slug}`}>
        <h1 className="mt-2 text-center font-display text-3xl font-normal leading-[1.1] text-balance text-heading transition-colors group-hover:text-white/80 sm:text-4xl">
          {post.title}
        </h1>
      </Link>
      {post.dek && (
        <p className="mx-auto mt-3 max-w-md text-center text-base leading-relaxed text-muted text-pretty">
          {post.dek}
        </p>
      )}
      <div className="mt-4 flex justify-center">
        <AuthorCaption post={post} />
      </div>
    </article>
  );
}

/** A compact row in the "Recent Essays" rail: small square thumb + title + byline. */
function EssayRow({ post }: { post: Post }) {
  return (
    <div className="group flex items-start gap-3 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="w-14 shrink-0">
        <Thumb post={post} square />
      </div>
      <div className="min-w-0">
        <Link href={`/posts/${post.slug}`}>
          <p className="text-[0.95rem] font-normal leading-snug text-heading transition-colors group-hover:text-white/80">
            {post.title}
          </p>
        </Link>
        <div className="mt-1.5">
          <AuthorCaption post={post} />
        </div>
      </div>
    </div>
  );
}

function TopBlock({ posts }: { posts: Post[] }) {
  const [feature, small1, small2, ...rest] = posts;
  const essays = rest.slice(0, 4);
  if (!feature) return null;
  return (
    <section className="border-b border-border px-4 py-10 xl:px-10 lg:py-14">
      <div className="container-wide grid gap-10 lg:grid-cols-[1fr_1.6fr_1fr] lg:gap-8">
        <div className="flex flex-col gap-10">
          {small1 && <SmallItem post={small1} />}
          {small2 && <SmallItem post={small2} />}
        </div>
        <TopFeature post={feature} />
        {essays.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-mono text-xs font-semibold uppercase tracking-wide text-muted">
                Recent Essays
              </p>
              <span aria-hidden className="text-muted">
                →
              </span>
            </div>
            <div>
              {essays.map((p) => (
                <EssayRow key={p.id} post={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** One square-grid "Dispatches" river section, one per real section. */
function DispatchSection({ name, posts }: { name: string; posts: Post[] }) {
  const items = posts.slice(0, 4);
  if (items.length === 0) return null;
  return (
    <section className="container-wide border-b border-border px-4 py-12 xl:px-10 lg:py-14">
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 className="font-mono text-lg font-bold uppercase tracking-wide text-heading sm:text-xl">
          Dispatches from {name}
        </h2>
        <Link
          href={sectionHref(name)}
          aria-label={`Read more ${name}`}
          className="shrink-0 text-muted transition-colors hover:text-white"
        >
          →
        </Link>
      </div>
      <p className="mb-8 max-w-xl text-sm leading-relaxed text-muted">
        The latest from {name.toLowerCase()}.
      </p>
      <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <article key={p.id} className="group">
            <Thumb post={p} square />
            <Link href={`/posts/${p.slug}`}>
              <p className="mt-4 font-display text-lg font-normal leading-snug text-heading transition-colors group-hover:text-white/80">
                {p.title}
              </p>
            </Link>
            {p.dek && (
              <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-muted">
                {p.dek}
              </p>
            )}
            <div className="mt-3">
              <AuthorCaption post={p} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CodexHome({ posts }: { posts: Post[] }) {
  const sections = allSections(posts);
  const sectionBlocks = sections
    .map((name) => ({ name, posts: postsInSection(posts, sectionSlug(name)) }))
    .filter((b) => b.posts.length > 0);

  return (
    <div style={DARK_VARS} className="bg-background text-foreground">
      <TopBlock posts={posts} />
      <PromoBand posts={posts} />
      {sectionBlocks.map((block) => (
        <DispatchSection key={block.name} name={block.name} posts={block.posts} />
      ))}
    </div>
  );
}

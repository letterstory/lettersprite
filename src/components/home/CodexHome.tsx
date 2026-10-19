import Link from "@/components/Link";
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
 * Codex front — a structural clone of every.to's homepage: a dominant,
 * centered "takeover" lead (rubric-free serif headline + dek + a solid
 * "Read now" button, framed by a light card) then a full-coverage river of
 * every real section with posts, alternating every.to's own two card
 * patterns (a plain 3-up grid, and a big feature beside a compact list).
 * No ads, no invented marketing bands — just preauthreview's real content.
 */

function ReadPill({ href, children }: { href: string; children: React.ReactNode }) {
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
      className="block overflow-hidden rounded-[0.375rem] bg-surfaceAlt"
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

/** The dominant centered "takeover" lead — every.to's homepage hero. */
function Lead({ post }: { post: Post }) {
  return (
    <div className="border-b border-border bg-[color:var(--surface)] px-4 py-16 text-center xl:px-10 lg:py-24">
      <article className="group mx-auto max-w-3xl">
        <Link href={`/posts/${post.slug}`}>
          <h1 className="font-display text-[2.4rem] font-normal leading-[1.08] text-balance text-heading transition-colors group-hover:text-primary sm:text-6xl lg:text-7xl">
            {post.title}
          </h1>
        </Link>
        {post.dek && (
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted text-pretty">
            {post.dek}
          </p>
        )}
        <Link
          href={`/posts/${post.slug}`}
          className="mt-8 inline-flex items-center justify-center rounded-[0.375rem] bg-primary px-6 py-3 text-sm font-semibold text-[color:var(--primary-fg)] transition-opacity hover:opacity-90"
        >
          Read now
        </Link>
      </article>
    </div>
  );
}

/** A 3-up grid card: cover, serif title, byline. No kickers, no deks. */
function GridCard({ post }: { post: Post }) {
  return (
    <article className="group flex flex-col">
      <Cover post={post} />
      <div className="mt-4">
        <Link href={`/posts/${post.slug}`}>
          <p className="text-xl font-normal leading-snug text-heading transition-colors group-hover:text-primary">
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

/** A small list row (thumbnail + title + dek) beside the section's big feature. */
function MiniRow({ post }: { post: Post }) {
  return (
    <div className="group flex gap-4 py-4 first:pt-0">
      <Link
        href={`/posts/${post.slug}`}
        className="block w-24 shrink-0 overflow-hidden rounded-[0.375rem] bg-surfaceAlt"
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
          <p className="text-[0.95rem] font-normal leading-snug text-heading transition-colors group-hover:text-primary">
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

/** The single large feature card used in the lead+list section pattern. */
function FeatureCard({ post }: { post: Post }) {
  return (
    <article className="group">
      <Cover post={post} priority />
      <div className="mt-5">
        <Link href={`/posts/${post.slug}`}>
          <p className="text-3xl font-normal leading-[1.15] text-heading transition-colors group-hover:text-primary lg:text-4xl">
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

function SectionHeading({ name }: { name: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
      <h2 className="font-display text-3xl font-normal text-heading sm:text-4xl">
        {name}
      </h2>
      <ReadPill href={sectionHref(name)}>
        Read More <span aria-hidden>→</span>
      </ReadPill>
    </div>
  );
}

function GridSection({ name, posts }: { name: string; posts: Post[] }) {
  const items = posts.slice(0, 3);
  return (
    <section className="container-wide px-4 py-14 xl:px-10 lg:py-16">
      <SectionHeading name={name} />
      <div className="grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <GridCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}

function ImageListSection({ name, posts }: { name: string; posts: Post[] }) {
  const [lead, ...rest] = posts;
  if (!lead) return null;
  const mini = rest.slice(0, 4);
  return (
    <section className="container-wide px-4 py-14 xl:px-10 lg:py-16">
      <SectionHeading name={name} />
      <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <FeatureCard post={lead} />
        {mini.length > 0 && (
          <div className="divide-y divide-border lg:border-l lg:border-border lg:pl-10">
            {mini.map((p) => (
              <MiniRow key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function CodexHome({ posts }: { posts: Post[] }) {
  const sections = allSections(posts);
  const [lead] = posts;

  const sectionBlocks = sections
    .map((name) => ({ name, posts: postsInSection(posts, sectionSlug(name)) }))
    .filter((b) => b.posts.length > 0);

  return (
    <div>
      {lead && <Lead post={lead} />}

      {sections.length > 0 && (
        <nav aria-label="Browse by section" className="swipe-x border-b border-border">
          <div className="container-wide flex w-max items-center gap-3 px-4 py-5 xl:px-10 lg:w-full lg:flex-wrap">
            <span className="kicker shrink-0 pr-2">Browse by section</span>
            {sections.map((s) => (
              <ReadPill key={s} href={sectionHref(s)}>
                {s}
              </ReadPill>
            ))}
          </div>
        </nav>
      )}

      {sectionBlocks.map((block, i) =>
        i % 2 === 0 ? (
          <ImageListSection key={block.name} name={block.name} posts={block.posts} />
        ) : (
          <GridSection key={block.name} name={block.name} posts={block.posts} />
        )
      )}
    </div>
  );
}

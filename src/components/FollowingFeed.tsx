"use client";

import Link from "@/components/Link";
import { useFollowing, type FollowEntry } from "@/lib/follow";
import { FollowButton } from "./FollowButton";

export type FollowSection = { name: string; slug: string; count: number };
export type FollowAuthor = { name: string; slug: string; count: number };
export type FeedPost = {
  slug: string;
  title: string;
  dek: string;
  sectionName: string;
  sectionSlug: string;
  authorName: string;
  authorSlug: string;
  dateLabel: string;
  cover: string;
  coverAlt: string;
};

/**
 * The /following experience. Reads the reader's localStorage follow list and
 * shows either (a) a welcoming empty state that invites a new reader to follow
 * sections and writers, or (b) a personal feed of the latest stories from what
 * they follow, a "You're following" manage strip, and more to discover. Static
 * page, dynamic per-device — no account required.
 */
export function FollowingFeed({
  sections,
  authors,
  posts,
}: {
  sections: FollowSection[];
  authors: FollowAuthor[];
  posts: FeedPost[];
}) {
  const [list, mounted] = useFollowing();

  const followedSections = new Set(list.filter((e) => e.kind === "section").map((e) => e.slug));
  const followedAuthors = new Set(list.filter((e) => e.kind === "author").map((e) => e.slug));
  const feed = posts.filter(
    (p) => followedSections.has(p.sectionSlug) || followedAuthors.has(p.authorSlug),
  );
  const empty = list.length === 0;

  const suggestSections = sections.filter((s) => !followedSections.has(s.slug)).slice(0, 10);
  const suggestAuthors = authors.filter((a) => !followedAuthors.has(a.slug)).slice(0, 8);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="border-b-2 border-foreground pb-5">
        <p className="font-display text-[0.7rem] font-bold uppercase tracking-[0.16em] text-primary">
          Your feed
        </p>
        <h1 className="mt-1 font-display text-4xl font-extrabold tracking-[-0.02em] text-heading sm:text-5xl">
          Following
        </h1>
        <p className="mt-2 max-w-2xl text-lg leading-snug text-fg-soft">
          Follow the sections and writers you care about to build a feed that&rsquo;s just yours.
          It lives on this device — no account needed.
        </p>
      </header>

      {/* Until mounted, both server and first client render agree on this
          neutral line, so returning readers never flash the empty state. */}
      {!mounted ? (
        <p className="py-16 text-center font-mono text-sm uppercase tracking-[0.16em] text-muted">
          Loading your feed…
        </p>
      ) : empty ? (
        <EmptyState sections={suggestSections} authors={suggestAuthors} />
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <FollowingStrip list={list} />
            {feed.length > 0 ? (
              <ol className="mt-8 divide-y divide-border border-t border-border">
                {feed.map((p) => (
                  <FeedRow key={p.slug} post={p} />
                ))}
              </ol>
            ) : (
              <p className="mt-8 border border-dashed border-border px-6 py-10 text-center text-muted">
                Nothing new from who you follow yet. Follow a few more sections or writers below.
              </p>
            )}
          </div>
          <aside className="min-w-0">
            <Discover sections={suggestSections} authors={suggestAuthors} />
          </aside>
        </div>
      )}
    </div>
  );
}

/** New-reader welcome: explain following, then a rich set of things to follow. */
function EmptyState({ sections, authors }: { sections: FollowSection[]; authors: FollowAuthor[] }) {
  return (
    <div className="mt-8">
      <div className="flex flex-col items-center border border-border bg-surface px-6 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary text-primary">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        <h2 className="mt-4 font-display text-2xl font-extrabold text-heading">
          You&rsquo;re not following anything yet
        </h2>
        <p className="mt-2 max-w-md text-muted">
          Pick a few sections and writers below. Your latest stories from them will show up here
          every time you visit.
        </p>
      </div>

      <FollowGroups sections={sections} authors={authors} />
    </div>
  );
}

/** The manage strip shown above the feed once you follow something. */
function FollowingStrip({ list }: { list: FollowEntry[] }) {
  return (
    <section>
      <h2 className="font-display text-[0.72rem] font-bold uppercase tracking-[0.14em] text-muted">
        You&rsquo;re following ({list.length})
      </h2>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {list.map((e) => (
          <FollowButton key={`${e.kind}:${e.slug}`} kind={e.kind} slug={e.slug} name={e.name} label={e.name} size="sm" />
        ))}
      </div>
    </section>
  );
}

/** Two labelled columns of Follow buttons — sections and writers. */
function FollowGroups({ sections, authors }: { sections: FollowSection[]; authors: FollowAuthor[] }) {
  return (
    <div className="mt-10 grid gap-10 sm:grid-cols-2">
      {sections.length > 0 && (
        <section>
          <h3 className="border-b border-border pb-2 font-display text-[0.72rem] font-bold uppercase tracking-[0.14em] text-primary">
            Sections
          </h3>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {sections.map((s) => (
              <FollowButton key={s.slug} kind="section" slug={s.slug} name={s.name} label={s.name} size="sm" />
            ))}
          </div>
        </section>
      )}
      {authors.length > 0 && (
        <section>
          <h3 className="border-b border-border pb-2 font-display text-[0.72rem] font-bold uppercase tracking-[0.14em] text-primary">
            Writers
          </h3>
          <ul className="mt-4 divide-y divide-border">
            {authors.map((a) => (
              <li key={a.slug} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/authors/${a.slug}`} className="min-w-0 truncate font-display text-sm font-bold text-heading transition-colors hover:text-primary">
                  {a.name}
                </Link>
                <FollowButton kind="author" slug={a.slug} name={a.name} size="sm" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** Compact "discover more" rail (single column) for the populated state. */
function Discover({ sections, authors }: { sections: FollowSection[]; authors: FollowAuthor[] }) {
  if (sections.length === 0 && authors.length === 0) return null;
  const s = sections.slice(0, 6);
  const a = authors.slice(0, 6);
  return (
    <div className="border-t-2 border-foreground pt-3">
      <h2 className="font-display text-[0.72rem] font-bold uppercase tracking-[0.14em] text-primary">
        Discover more
      </h2>
      {s.length > 0 && (
        <>
          <h3 className="mt-4 font-display text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted">
            Sections
          </h3>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {s.map((x) => (
              <FollowButton key={x.slug} kind="section" slug={x.slug} name={x.name} label={x.name} size="sm" />
            ))}
          </div>
        </>
      )}
      {a.length > 0 && (
        <>
          <h3 className="mt-5 font-display text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted">
            Writers
          </h3>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {a.map((x) => (
              <FollowButton key={x.slug} kind="author" slug={x.slug} name={x.name} label={x.name} size="sm" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FeedRow({ post }: { post: FeedPost }) {
  return (
    <li className="group grid grid-cols-[1fr_auto] gap-4 py-5 first:pt-0">
      <div className="min-w-0">
        <p className="font-display text-[0.66rem] font-bold uppercase tracking-[0.08em]">
          <Link href={`/sections/${post.sectionSlug}`} className="text-primary transition-opacity hover:opacity-70">
            {post.sectionName}
          </Link>
          <span className="ml-2 text-muted">{post.dateLabel}</span>
        </p>
        <Link href={`/posts/${post.slug}`}>
          <h3 className="mt-1.5 font-display text-xl font-extrabold leading-tight text-heading transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>
        {post.dek && <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-fg-soft">{post.dek}</p>}
        <p className="mt-1.5 font-display text-[0.66rem] font-bold uppercase tracking-[0.08em] text-muted">
          By{" "}
          <Link href={`/authors/${post.authorSlug}`} className="text-primary transition-opacity hover:opacity-70">
            {post.authorName}
          </Link>
        </p>
      </div>
      <Link href={`/posts/${post.slug}`} className="block h-20 w-24 shrink-0 overflow-hidden bg-surfaceAlt">
        <img src={post.cover} alt={post.coverAlt} loading="lazy" className="h-full w-full object-cover" />
      </Link>
    </li>
  );
}

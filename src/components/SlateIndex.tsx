import type { ReactNode } from "react";
import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { publishDate, sectionFor } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { Cover } from "@/components/Story";

/**
 * Slate-style index layout, shared by section and author pages: an oversized
 * heavy-sans title with an italic eyebrow and a row of accent links, a
 * byline-first lead + rail, then a "Recently in / More from …" river of
 * thumbnail rows. Headlines are `font-display` (serif); the title, eyebrow's
 * partner chrome, and bylines are `font-heading` (sans) — so the whole thing
 * follows the active theme's fonts.
 *
 * `metaKind` picks what the byline slot shows: on a section page the author is
 * meaningful ("author"), on an author page the beat is ("section"). Either way
 * it's paired with the publish date.
 */
function MetaLine({
  post,
  metaKind,
  className = "",
}: {
  post: Post;
  metaKind: "author" | "section";
  className?: string;
}) {
  const label = metaKind === "author" ? sectionFor(post) : post.author;
  return (
    <p
      className={`font-heading text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted ${className}`}
    >
      {label}
      <span className="mx-1.5 text-border">·</span>
      <time className="font-semibold">{formatDate(publishDate(post))}</time>
    </p>
  );
}

export function SlateIndex({
  eyebrow,
  title,
  accentLinks = [],
  avatar,
  bio,
  stat,
  metaKind,
  riverPrefix,
  posts,
  footer,
}: {
  eyebrow: string;
  title: string;
  accentLinks?: { label: string; href: string }[];
  avatar?: { initials: string; color: string };
  bio?: string;
  stat?: string;
  metaKind: "author" | "section";
  riverPrefix: string;
  posts: Post[];
  footer?: ReactNode;
}) {
  const [lead, ...rest] = posts;
  const rail = rest.slice(0, 4);
  const river = rest.slice(4);

  return (
    <div className="container-wide px-6 py-10">
      {/* Masthead: italic eyebrow, oversized heavy title, accent links. */}
      <header className="mb-10 border-b border-border pb-8">
        {avatar ? (
          <div className="flex items-center gap-5">
            <span
              className="avatar h-16 w-16 shrink-0 text-xl sm:h-20 sm:w-20 sm:text-2xl"
              style={{ backgroundColor: avatar.color }}
              aria-hidden
            >
              {avatar.initials}
            </span>
            <div className="min-w-0">
              <p className="font-display text-sm italic text-muted">{eyebrow}</p>
              <h1 className="mt-0.5 text-5xl font-extrabold uppercase leading-[0.9] tracking-tight text-heading sm:text-6xl">
                <span className="font-heading">{title}</span>
              </h1>
            </div>
          </div>
        ) : (
          <>
            <p className="font-display text-sm italic text-muted">{eyebrow}</p>
            <h1 className="mt-1 text-6xl font-extrabold uppercase leading-[0.9] tracking-tight text-heading sm:text-7xl">
              <span className="font-heading">{title}</span>
            </h1>
          </>
        )}

        {bio && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fg-soft">
            {bio}
          </p>
        )}

        {(stat || accentLinks.length > 0) && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {stat && (
              <span className="font-heading text-xs font-bold uppercase tracking-[0.14em] text-muted">
                {stat}
              </span>
            )}
            {accentLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-heading text-xs font-bold text-primary transition-opacity hover:opacity-70"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Lead block: big lead left, byline-first rail right. */}
      <section className="mb-12 grid gap-8 border-b border-border pb-12 lg:grid-cols-12">
        {lead && (
          <article className="group lg:col-span-8">
            <Cover post={lead} ratio="16/9" priority />
            <MetaLine post={lead} metaKind={metaKind} className="mt-4" />
            <Link href={`/posts/${lead.slug}`}>
              <h2 className="mt-2 font-display text-3xl font-bold leading-[1.08] text-primary text-balance transition-opacity group-hover:opacity-80 sm:text-4xl">
                {lead.title}
              </h2>
            </Link>
            {lead.dek && (
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-fg-soft">
                {lead.dek}
              </p>
            )}
          </article>
        )}

        {rail.length > 0 && (
          <div className="flex flex-col divide-y divide-border lg:col-span-4 lg:border-l lg:border-border lg:pl-8">
            {rail.map((p) => (
              <article key={p.id} className="group py-4 first:pt-0 last:pb-0">
                <MetaLine post={p} metaKind={metaKind} />
                <Link href={`/posts/${p.slug}`}>
                  <h3 className="mt-1.5 font-display text-lg font-bold leading-snug text-heading text-balance transition-colors group-hover:text-primary">
                    {p.title}
                  </h3>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* "Recently in / More from …" river. */}
      {river.length > 0 && (
        <>
          <div className="mb-5 flex items-baseline justify-between border-b-2 border-foreground pb-2">
            <h2 className="text-2xl font-extrabold text-heading">
              <span className="font-heading">{riverPrefix} </span>
              <span className="font-heading text-primary">{title}</span>
            </h2>
            <span className="hidden font-heading text-xs text-muted sm:block">
              Showing 1–{posts.length} of {posts.length}
            </span>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {river.map((p) => (
              <article key={p.id} className="group flex gap-5 py-5">
                <Cover post={p} ratio="4/3" className="w-32 shrink-0 sm:w-44" />
                <div className="min-w-0">
                  <MetaLine post={p} metaKind={metaKind} />
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
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {footer && <div className="mt-16 flex justify-center">{footer}</div>}
    </div>
  );
}

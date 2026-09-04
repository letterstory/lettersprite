import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { AdSlot } from "@/components/AdSlot";
import { env } from "@/env";
import { publishDate, sectionFor, sectionHref } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { makeCovers } from "@/lib/stock-covers";

/**
 * Folio front — a take on grafill.no's design-magazine layout: thin-bordered
 * cards, Caslon serif uppercase headlines, circular cropped imagery, centered
 * serif editorial callouts with underlined links, mint date chips, occasional
 * dark cards, and an asymmetric grid. Rendered in HammerFin's palette.
 */

const initial = (env.siteTitle.replace(/^(the|a|an)\s+/i, "").trim()[0] || "H").toUpperCase();

function Label({ post, className = "" }: { post: Post; className?: string }) {
  return (
    <Link
      href={sectionHref(sectionFor(post))}
      className={`font-sans text-[0.68rem] font-bold uppercase tracking-[0.12em] text-heading transition-colors hover:text-primary ${className}`}
    >
      {sectionFor(post)}
    </Link>
  );
}

function DateStr({ post }: { post: Post }) {
  return (
    <span className="font-sans text-[0.68rem] uppercase tracking-[0.1em] text-muted">
      {formatDate(publishDate(post))}
    </span>
  );
}

/** A circular cropped cover — grafill's signature image treatment. */
function Circle({ src, alt = "", className = "" }: { src: string; alt?: string; className?: string }) {
  return (
    <span className={`block aspect-square overflow-hidden rounded-full ${className}`}>
      <img src={src} alt={alt} className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.04]" />
    </span>
  );
}

/** A centered serif editorial callout with the mark + underlined links. */
function Callout({ children }: { children: React.ReactNode }) {
  return (
    <section className="container-wide px-6 py-8 sm:py-10">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-heading font-display text-lg leading-none text-background">
          {initial}
        </span>
        <p className="font-display text-2xl leading-snug text-heading text-balance sm:text-[1.9rem] [&_a]:underline [&_a]:decoration-primary [&_a]:decoration-2 [&_a]:underline-offset-4 [&_a:hover]:text-primary">
          {children}
        </p>
      </div>
    </section>
  );
}

/** The big lead feature: image grows to fill the column, then label / headline / dek. */
function Feature({ post, cover }: { post: Post; cover: string }) {
  return (
    <article className="group flex h-full flex-col border border-border bg-surface">
      <Link href={`/posts/${post.slug}`} className="block min-h-0 flex-1 overflow-hidden">
        <img
          src={cover}
          alt={post.title}
          className="h-full min-h-[15rem] w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-col p-6 sm:p-7">
        <div className="mb-3 flex items-center gap-3">
          <Label post={post} />
          <DateStr post={post} />
        </div>
        <Link href={`/posts/${post.slug}`}>
          <h2 className="font-display text-2xl font-bold uppercase leading-[1.08] tracking-tight text-heading text-balance transition-colors group-hover:text-primary sm:text-[1.9rem]">
            {post.title}
          </h2>
        </Link>
        {post.dek && (
          <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-fg-soft">{post.dek}</p>
        )}
      </div>
    </article>
  );
}

/** A card with a mint date-chip header + circular image (grafill's "event" card). */
function ChipCard({ post, cover }: { post: Post; cover: string }) {
  return (
    <article className="group flex flex-col border border-border bg-surface">
      <div className="flex items-center justify-between bg-[#bee0cb] px-4 py-2">
        <DateStr post={post} />
        <Label post={post} className="text-[0.62rem]" />
      </div>
      <div className="flex flex-1 flex-col items-center p-6 text-center">
        <Link href={`/posts/${post.slug}`} className="w-32">
          <Circle src={cover} alt={post.title} />
        </Link>
        <Link href={`/posts/${post.slug}`}>
          <h3 className="mt-5 font-display text-lg font-bold uppercase leading-tight tracking-tight text-heading text-balance transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>
        {post.dek && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-fg-soft">{post.dek}</p>
        )}
      </div>
    </article>
  );
}

/** A dark card (grafill's "marketplace" cards) — dark ground, circular image. */
function DarkCard({ post, cover }: { post: Post; cover: string }) {
  return (
    <article className="group flex flex-col bg-heading p-6 text-center text-background">
      <Link href={`/posts/${post.slug}`} className="mx-auto w-28">
        <Circle src={cover} alt={post.title} />
      </Link>
      <span className="mt-5 font-sans text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[color:var(--accent)]">
        {sectionFor(post)}
      </span>
      <Link href={`/posts/${post.slug}`}>
        <h3 className="mt-2 font-display text-lg font-bold uppercase leading-tight tracking-tight text-background text-balance transition-opacity group-hover:opacity-80">
          {post.title}
        </h3>
      </Link>
    </article>
  );
}

export function FolioHome({ posts }: { posts: Post[] }) {
  const covers = makeCovers(posts);
  const cv = (slug: string) => covers.get(slug) ?? "";
  const [lead, ...rest] = posts;
  const railTop = rest[0];
  const railList = rest.slice(1, 5);
  const row1 = rest.slice(5, 8);
  const featB = rest[8];
  const featBText = rest[9];
  const dark = rest.slice(10, 13);
  const tail = rest.slice(13, 19);

  const link = (post: Post) => (
    <Link href={sectionHref(sectionFor(post))}>{sectionFor(post).toLowerCase()}</Link>
  );

  return (
    <div>
      {/* Announcement strip. */}
      <div className="border-b border-border bg-[color:var(--accent)]">
        <div className="container-wide px-6 py-2.5 text-center font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-heading">
          {env.siteTagline || "Tools for finance teams"} — the operator's field guide
        </div>
      </div>

      {/* Top feature row: big feature + featured rail (card + Latest list). */}
      <section className="container-wide grid items-stretch gap-6 px-6 pb-6 pt-8 lg:grid-cols-3">
        <div className="lg:col-span-2">{lead && <Feature post={lead} cover={cv(lead.slug)} />}</div>
        <div className="flex flex-col gap-6 lg:col-span-1">
          {railTop && <ChipCard post={railTop} cover={cv(railTop.slug)} />}
          {railList.length > 0 && (
            <div className="flex-1 border border-border bg-surface">
              <div className="border-b border-border px-5 py-3 font-sans text-[0.7rem] font-bold uppercase tracking-[0.14em] text-heading">
                Latest
              </div>
              <ul className="divide-y divide-border">
                {railList.map((p) => (
                  <li key={p.id} className="group px-5 py-4">
                    <DateStr post={p} />
                    <Link href={`/posts/${p.slug}`}>
                      <h3 className="mt-1 font-display text-[0.95rem] font-bold uppercase leading-snug tracking-tight text-heading transition-colors group-hover:text-primary">
                        {p.title}
                      </h3>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {row1[0] && (
        <Callout>
          Cleaning up your {link(row1[0])}? See how finance teams cut days off the
          close and kill the manual busywork.
        </Callout>
      )}

      {/* Three-up chip cards. */}
      {row1.length > 0 && (
        <section className="container-wide grid gap-6 px-6 pb-4 sm:grid-cols-2 lg:grid-cols-3">
          {row1.map((p) => (
            <ChipCard key={p.id} post={p} cover={cv(p.slug)} />
          ))}
        </section>
      )}

      {/* Feature + text pair. */}
      {(featB || featBText) && (
        <section className="container-wide grid gap-6 px-6 py-10 lg:grid-cols-2">
          {featB && <Feature post={featB} cover={cv(featB.slug)} />}
          {featBText && (
            <article className="group flex flex-col justify-center border border-border bg-surface p-8 sm:p-10">
              <div className="mb-3 flex items-center gap-3">
                <Label post={featBText} />
                <DateStr post={featBText} />
              </div>
              <Link href={`/posts/${featBText.slug}`}>
                <h2 className="font-display text-2xl font-bold uppercase leading-[1.08] tracking-tight text-heading text-balance transition-colors group-hover:text-primary sm:text-3xl">
                  {featBText.title}
                </h2>
              </Link>
              {featBText.dek && (
                <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-fg-soft">
                  {featBText.dek}
                </p>
              )}
            </article>
          )}
        </section>
      )}

      {featBText && (
        <Callout>
          Choosing {link(featBText)} software? Start with the criteria that
          actually matter — data integration first, demos last.
        </Callout>
      )}

      {/* Dark cards row. */}
      {dark.length > 0 && (
        <section className="container-wide grid gap-6 px-6 pb-4 sm:grid-cols-2 lg:grid-cols-3">
          {dark.map((p) => (
            <DarkCard key={p.id} post={p} cover={cv(p.slug)} />
          ))}
        </section>
      )}

      {/* Tail grid. */}
      {tail.length > 0 && (
        <section className="container-wide grid gap-6 px-6 py-10 sm:grid-cols-2 lg:grid-cols-3">
          {tail.map((p) => (
            <ChipCard key={p.id} post={p} cover={cv(p.slug)} />
          ))}
        </section>
      )}

      <div className="container-wide px-6 pb-14">
        <AdSlot minHeightClass="min-h-[90px]" />
      </div>
    </div>
  );
}

import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { AdSlot } from "@/components/AdSlot";
import { env } from "@/env";
import { publishDate, sectionFor, sectionHref } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { makeCovers } from "@/lib/stock-covers";

/**
 * Boom front — a faithful take on creativeboom.com's magazine layout: a cream
 * hero band (two stacked cards left, a dominant feature centre, a four-item
 * text list right), a big "Most read" block (one large + two medium + a row of
 * four), a black promo band, and a "Latest" grid. Cards follow Creative Boom's
 * anatomy exactly — image, outline category pills, bold headline, date.
 *
 * Type: ABC Diatype (headlines/body) + Roobert (the big section titles), the
 * actual faces Creative Boom uses.
 */

// Stock-photo covers (round-robin per beat) live in src/lib/stock-covers.ts.

function Pill({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-full border border-heading/30 px-3 py-[0.2rem] text-[0.66rem] font-medium uppercase leading-none tracking-wide text-heading">
      {label}
    </span>
  );
}

function Meta({ post }: { post: Post }) {
  return (
    <time className="mt-2 block text-sm text-muted">
      {formatDate(publishDate(post))}
    </time>
  );
}

/** The card image: a curated stock photo for the post's beat (see makeCovers). */
function Cover({
  cover,
  slug,
  title,
  ratio = "4/3",
}: {
  cover: string;
  slug: string;
  title: string;
  ratio?: string;
}) {
  return (
    <Link
      href={`/posts/${slug}`}
      className="block w-full overflow-hidden"
      style={{ aspectRatio: ratio }}
    >
      <div className="relative h-full w-full overflow-hidden">
        <img
          src={cover}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
          style={{ filter: "saturate(1.05) contrast(1.02)" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: "#b5451b", opacity: 0.05, mixBlendMode: "multiply" }}
        />
      </div>
    </Link>
  );
}

function Card({
  post,
  cover,
  size = "md",
}: {
  post: Post;
  cover: string;
  size?: "sm" | "md" | "lg";
}) {
  const ratio = size === "lg" ? "16/10" : "4/3";
  const head =
    size === "lg"
      ? "text-3xl sm:text-[2.1rem] leading-[1.08]"
      : size === "md"
        ? "text-xl leading-snug"
        : "text-lg leading-snug";
  return (
    <article className="group flex flex-col">
      <Cover cover={cover} slug={post.slug} title={post.title} ratio={ratio} />
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Pill label={sectionFor(post)} />
      </div>
      <Link href={`/posts/${post.slug}`}>
        <h3
          className={`mt-2.5 font-display font-bold tracking-[-0.01em] text-heading text-balance transition-colors group-hover:text-primary ${head}`}
        >
          {post.title}
        </h3>
      </Link>
      {size === "lg" && post.dek && (
        <p className="mt-2 max-w-xl text-base leading-relaxed text-fg-soft">
          {post.dek}
        </p>
      )}
      <Meta post={post} />
    </article>
  );
}

/** A text-only row for the hero's right rail (Creative Boom's "Insight" list). */
function ListRow({ post }: { post: Post }) {
  return (
    <article className="group border-t border-border py-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap gap-1.5">
        <Pill label={sectionFor(post)} />
      </div>
      <Link href={`/posts/${post.slug}`}>
        <h3 className="mt-2 font-display text-[0.98rem] font-bold leading-snug tracking-[-0.01em] text-heading transition-colors group-hover:text-primary">
          {post.title}
        </h3>
      </Link>
      <Meta post={post} />
    </article>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading text-4xl font-bold tracking-[-0.02em] text-heading sm:text-5xl">
      {children}
    </h2>
  );
}

export function BoomHome({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts;
  const covers = makeCovers(posts);
  const cv = (slug: string) => covers.get(slug) ?? "";
  const leftCards = rest.slice(0, 2);
  const rightList = rest.slice(2, 6);
  const mrLead = rest[6];
  const mrMed = rest.slice(7, 9);
  const mrRow = rest.slice(9, 13);
  const latest = rest.slice(13, 21);

  return (
    <div>
      {/* Masthead flag — the publication title, on the same band as the hero. */}
      <section className="bg-surface">
        <div className="container-wide px-6 pt-6 pb-2 sm:pt-7 sm:pb-2">
          <p className="font-display text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-foreground/55">
            The Weekly Letter{env.established ? ` · Est. ${env.established}` : ""}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold leading-[1] tracking-[-0.03em] text-heading sm:text-[2.6rem]">
            {env.siteTitle}
          </h1>
          {env.siteTagline && (
            <p className="mt-4 max-w-2xl text-lg italic leading-relaxed text-fg-soft sm:text-xl">
              {env.siteTagline}
            </p>
          )}
        </div>
      </section>

      {/* Hero band. */}
      <section className="bg-surface">
        <div className="container-wide grid gap-8 px-6 pb-10 pt-3 lg:grid-cols-12">
          {/* Left — two stacked cards. */}
          <div className="flex flex-col gap-8 lg:col-span-3">
            {leftCards.map((p) => (
              <Card key={p.id} post={p} cover={cv(p.slug)} size="sm" />
            ))}
          </div>
          {/* Centre — dominant feature. */}
          <div className="lg:col-span-6">{lead && <Card post={lead} cover={cv(lead.slug)} size="lg" />}</div>
          {/* Right — text list. */}
          <div className="flex flex-col lg:col-span-3 lg:border-l lg:border-border lg:pl-8">
            {rightList.map((p) => (
              <ListRow key={p.id} post={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Most read. */}
      {mrLead && (
        <section className="container-wide px-6 py-14">
          <SectionTitle>Most read</SectionTitle>
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Card post={mrLead} cover={cv(mrLead.slug)} size="lg" />
            </div>
            {mrMed.map((p) => (
              <Card key={p.id} post={p} cover={cv(p.slug)} size="md" />
            ))}
          </div>
          {mrRow.length > 0 && (
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {mrRow.map((p) => (
                <Card key={p.id} post={p} cover={cv(p.slug)} size="sm" />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Black promo band — the newsletter. */}
      <section className="bg-[#15181c] text-[#eef1f4]">
        <div className="container-wide grid items-center gap-8 px-6 py-16 lg:grid-cols-2">
          <h2 className="font-heading text-4xl font-bold leading-[1.02] tracking-[-0.02em] text-[#eef1f4] sm:text-6xl">
            The Letter
          </h2>
          <div>
            <p className="max-w-md text-lg leading-relaxed text-[#f7f4ef]/75">
              A weekly brief on funds, LPs and the funding landscape — read by the
              people who allocate. No noise.
            </p>
            <form className="mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
              <input
                type="email"
                placeholder="you@fund.com"
                aria-label="Email address"
                className="w-full flex-1 rounded-sm border border-white/25 bg-transparent px-4 py-3 text-sm text-[#f7f4ef] placeholder:text-[#f7f4ef]/40 focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                className="rounded-sm bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--primary-fg)] transition-opacity hover:opacity-90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Latest. */}
      {latest.length > 0 && (
        <section className="container-wide px-6 py-14">
          <SectionTitle>Latest</SectionTitle>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((p) => (
              <Card key={p.id} post={p} cover={cv(p.slug)} size="sm" />
            ))}
          </div>
          <AdSlot className="mt-14" minHeightClass="min-h-[90px]" />
        </section>
      )}
    </div>
  );
}

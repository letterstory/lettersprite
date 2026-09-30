import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { publishDate, readingTimeLabel, sectionFor, sectionHref } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { bylineFor } from "@/lib/author";
import { coverAltFor, coverImageFor } from "@/lib/covers";
import { FakeAd } from "@/components/FakeAd";
import { MockPost } from "@/components/MockPost";

/**
 * Riot front — a bold, high-contrast youth-culture magazine grid (FURFUR-style)
 * in the deployment's own palette. An asymmetric hero zone (a big image tile
 * with the headline burned into the image, a mixed right rail, an ad column),
 * then image-forward card rows, a two-column icon-thumbnail news list, section
 * bands and portrait cards, with house-ad wells throughout — a long, dense
 * scroll. Condensed uppercase display over serif card headlines; sharp corners.
 */

function Meta({ post, light = false }: { post: Post; light?: boolean }) {
  return (
    <p className={`mt-2 flex items-center gap-3 font-display text-[0.66rem] font-medium uppercase tracking-[0.12em] ${light ? "text-white/70" : "text-muted"}`}>
      <span>{formatDate(publishDate(post))}</span>
      <span aria-hidden className={light ? "text-white/40" : "text-border"}>·</span>
      <span>{readingTimeLabel(post)}</span>
    </p>
  );
}

function Kicker({ name, light = false }: { name: string; light?: boolean }) {
  return (
    <span className={`font-display text-[0.7rem] font-semibold uppercase tracking-[0.16em] ${light ? "text-white" : "text-primary"}`}>
      {name}
    </span>
  );
}

/** A big image tile with kicker + condensed uppercase headline burned into it. */
function HeroTile({ post, ratio = "4/3", size = 1200 }: { post: Post; ratio?: string; size?: number }) {
  const name = sectionFor(post);
  return (
    <article className="group relative overflow-hidden bg-secondary">
      <Link href={`/posts/${post.slug}`} className="block">
        <img
          src={coverImageFor(post, size)}
          alt={coverAltFor(post)}
          fetchPriority="high"
          style={{ aspectRatio: ratio }}
          className="w-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
        />
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-7 text-center">
          <Kicker name={name} light />
          <h2 className="mt-2 max-w-[18ch] font-display text-3xl font-bold uppercase leading-[0.98] tracking-[0.005em] text-white sm:text-4xl md:text-[2.9rem]">
            {post.title}
          </h2>
          <Meta post={post} light />
        </div>
      </Link>
    </article>
  );
}

/** Image on top, serif headline below — the workhorse magazine card. */
function ImageCard({ post, ratio = "16/10", size = 640 }: { post: Post; ratio?: string; size?: number }) {
  return (
    <article className="group">
      <Link href={`/posts/${post.slug}`} className="block overflow-hidden bg-surfaceAlt">
        <img src={coverImageFor(post, size)} alt={coverAltFor(post)} loading="lazy" style={{ aspectRatio: ratio }} className="w-full object-cover transition-opacity duration-300 group-hover:opacity-90" />
      </Link>
      <div className="mt-3">
        <Kicker name={sectionFor(post)} />
        <Link href={`/posts/${post.slug}`}>
          <h3 className="mt-1.5 font-heading text-xl font-bold leading-[1.12] text-heading transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>
        {post.dek && <p className="mt-1.5 line-clamp-2 text-[0.95rem] leading-snug text-fg-soft">{post.dek}</p>}
        <Meta post={post} />
      </div>
    </article>
  );
}

/** Right-rail: small horizontal card — square thumb + serif headline. */
function SmallStory({ post }: { post: Post }) {
  return (
    <article className="group grid grid-cols-[76px_1fr] gap-3.5 border-t border-border pt-4 first:border-t-0 first:pt-0">
      <Link href={`/posts/${post.slug}`} className="block aspect-square overflow-hidden bg-surfaceAlt">
        <img src={coverImageFor(post, 200)} alt={coverAltFor(post)} loading="lazy" className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90" />
      </Link>
      <div className="min-w-0">
        <Link href={`/posts/${post.slug}`}>
          <h4 className="font-heading text-[0.98rem] font-bold leading-[1.15] text-heading transition-colors group-hover:text-primary">
            {post.title}
          </h4>
        </Link>
        <Meta post={post} />
      </div>
    </article>
  );
}

/** A section band label — a heavy black bar with an orange tick. */
function BandLabel({ name }: { name: string }) {
  return (
    <Link href={sectionHref(name)} className="group mb-6 flex items-center gap-3 border-b-4 border-secondary pb-2">
      <span aria-hidden className="h-4 w-2.5 bg-primary" />
      <span className="font-display text-lg font-semibold uppercase tracking-[0.08em] text-heading transition-colors group-hover:text-primary">
        {name}
      </span>
    </Link>
  );
}

/**
 * A sticky "skyscraper" house ad parked in the page gutter on wide screens
 * (≥1640px, where there's room beside the centered container). Invented brand,
 * riot palette, motif contained by `relative overflow-hidden`. Decorative only.
 */
function SideAd({ side }: { side: "left" | "right" }) {
  const c =
    side === "left"
      ? { brand: "PARSEC", tag: "Uptime you can bet on.", cta: "Start free", bg: "#f5622d", fg: "#ffffff", accent: "#0f0e0c" }
      : { brand: "SENTRYLOOP", tag: "Catch every silent failure.", cta: "Get a key", bg: "#0f0e0c", fg: "#f5622d", accent: "#f5622d" };
  return (
    <aside
      aria-hidden
      className={`fixed top-1/2 z-30 hidden w-[140px] -translate-y-1/2 min-[1640px]:block ${side === "left" ? "left-4" : "right-4"}`}
    >
      <p className="mb-1 text-center font-mono text-[0.5rem] uppercase tracking-[0.22em] text-muted">Advertisement</p>
      <div
        className="ad-anim relative flex h-[560px] flex-col justify-between overflow-hidden p-4"
        style={{ backgroundColor: c.bg, color: c.fg }}
      >
        <svg aria-hidden className="ad-motif pointer-events-none absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none">
          <defs>
            <pattern id={`sky-${side}`} width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="13" height="26" fill={c.accent} />
            </pattern>
          </defs>
          <rect width="120%" height="120%" fill={`url(#sky-${side})`} />
        </svg>
        <div className="relative z-10 flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center border-2 font-display text-sm font-extrabold" style={{ borderColor: c.fg }}>
            {c.brand[0]}
          </span>
          <span className="font-display text-sm font-bold uppercase tracking-[0.04em]">{c.brand}</span>
        </div>
        <div className="relative z-10">
          <p className="font-display text-xl font-extrabold uppercase leading-[1.03]">{c.tag}</p>
          <span className="mt-3 inline-block px-3 py-1.5 font-display text-[0.68rem] font-bold uppercase tracking-wider" style={{ backgroundColor: c.fg, color: c.bg }}>
            {c.cta} →
          </span>
        </div>
      </div>
    </aside>
  );
}

export function RiotHome({ posts }: { posts: Post[] }) {
  const lead = posts[0];
  const railTop = posts.slice(1, 3);
  const row1 = posts.slice(3, 6);
  const feature = posts[6];
  const newsList = posts.slice(7, 15);
  const sections = [...new Set(posts.map((p) => sectionFor(p)))];
  const bySection = (name: string) => posts.filter((p) => sectionFor(p) === name);
  const blocks = sections
    .map((name) => {
      const items = bySection(name);
      return items.length >= 2 ? { name, items } : null;
    })
    .filter(Boolean) as { name: string; items: Post[] }[];
  const tail = posts.slice(11);

  return (
    <div className="container-wide px-4 pb-20 pt-8 sm:px-6">
      <SideAd side="left" />
      <SideAd side="right" />

      {/* Hero zone: big burned-in hero + mixed right rail + ad column. */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)_300px]">
        {lead && <HeroTile post={lead} />}
        <div className="flex flex-col gap-6">
          {railTop[0] && <ImageCard post={railTop[0]} ratio="16/9" />}
          {railTop[1] && <SmallStory post={railTop[1]} />}
        </div>
        <div className="relative hidden overflow-hidden xl:block">
          <FakeAd variant="box" seed={0} />
        </div>
      </section>

      {/* Row of three image cards. */}
      {row1.length > 0 && (
        <section className="mt-12 grid gap-6 border-t-4 border-secondary pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {row1.map((p) => <ImageCard key={p.id} post={p} ratio="4/3" />)}
        </section>
      )}

      <div className="relative mt-12 overflow-hidden border-y border-border py-6">
        <FakeAd variant="leaderboard" seed={3} />
      </div>

      {/* Centered feature tile + a two-column icon-thumbnail news list beside it. */}
      <section className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {feature && (
          <div>
            <HeroTile post={feature} ratio="16/11" size={900} />
          </div>
        )}
        {newsList.length > 0 && (
          <div>
            <BandLabel name="Newswire" />
            <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {newsList.map((p) => (
                <li key={p.id} className="group flex gap-3 border-b border-border pb-4">
                  <Link href={`/posts/${p.slug}`} className="block h-14 w-14 shrink-0 overflow-hidden bg-surfaceAlt">
                    <img src={coverImageFor(p, 140)} alt={coverAltFor(p)} loading="lazy" className="h-full w-full object-cover" />
                  </Link>
                  <Link href={`/posts/${p.slug}`}>
                    <h4 className="font-heading text-[0.92rem] font-bold leading-[1.14] text-heading transition-colors group-hover:text-primary">
                      {p.title}
                    </h4>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Per-section bands — a lead image card + a stack of small stories. */}
      {blocks.map((block, i) => (
        <section key={block.name} className="mt-14">
          <BandLabel name={block.name} />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="grid gap-6 sm:grid-cols-2">
              {block.items.slice(0, 2).map((p) => <ImageCard key={p.id} post={p} ratio="4/3" />)}
            </div>
            <div className="flex flex-col gap-4">
              {block.items.slice(2, 6).map((p) => <SmallStory key={p.id} post={p} />)}
            </div>
          </div>
          {i === 0 && (
            <div className="relative mt-12 overflow-hidden border-y border-border py-6">
              <FakeAd variant="leaderboard" seed={4} />
            </div>
          )}
        </section>
      ))}

      {/* Mock Twitter embeds — a timeline band. */}
      <section className="mt-16">
        <div className="mb-6 flex items-center gap-3 border-b-4 border-secondary pb-2">
          <span aria-hidden className="h-4 w-2.5 bg-primary" />
          <span className="font-display text-lg font-semibold uppercase tracking-[0.08em] text-heading">On The Timeline</span>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <MockPost variant="twitter" seed={0} />
          <MockPost variant="twitter" seed={1} />
        </div>
      </section>

      {/* A full-bleed second feature to break the rhythm and add scale. */}
      {posts[10] && (
        <section className="mt-16">
          <HeroTile post={posts[10]} ratio="21/9" size={1600} />
        </section>
      )}

      {/* Most Read — a numbered two-column list. */}
      {posts.length > 0 && (
        <section className="mt-16">
          <BandLabel name="Most Read" />
          <ol className="grid sm:grid-cols-2 sm:gap-x-12">
            {posts.slice(0, 8).map((p, i) => (
              <li key={`mr-${p.id}`} className="group flex items-baseline gap-4 border-b border-border py-4">
                <span className="font-display text-2xl font-bold leading-none text-primary">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <Link href={`/posts/${p.slug}`}>
                    <h4 className="font-heading text-lg font-bold leading-[1.15] text-heading transition-colors group-hover:text-primary">{p.title}</h4>
                  </Link>
                  <Meta post={p} />
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="relative mt-16 overflow-hidden border-y border-border py-6">
        <FakeAd variant="leaderboard" seed={2} />
      </div>

      {/* Tail river — taller 3-up cards with deks, ending long. */}
      {tail.length > 0 && (
        <section className="mt-16">
          <BandLabel name="More" />
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {tail.map((p) => <ImageCard key={p.id} post={p} ratio="4/3" size={640} />)}
          </div>
        </section>
      )}

      <div className="relative mt-12 overflow-hidden border-y border-border py-6">
        <FakeAd variant="leaderboard" seed={5} />
      </div>
    </div>
  );
}

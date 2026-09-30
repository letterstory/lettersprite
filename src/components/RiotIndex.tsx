import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { publishDate, readingTimeLabel, sectionFor } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { coverAltFor, coverImageFor } from "@/lib/covers";
import { FakeAd } from "@/components/FakeAd";

/**
 * Riot section/author index — a FURFUR category-page river (furfur.me/furfur/…):
 * a heavy condensed title with an orange tick, a 3-up image-card lead, a big
 * burned-in feature tile beside a small-story rail + house ad, another card
 * row, and a dense tail river. Image-forward, sharp corners, condensed display
 * over serif card headlines — the section scoped cousin of the riot front.
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

function HeroTile({ post, ratio = "16/10", size = 900 }: { post: Post; ratio?: string; size?: number }) {
  return (
    <article className="group relative overflow-hidden bg-secondary">
      <Link href={`/posts/${post.slug}`} className="block">
        <img src={coverImageFor(post, size)} alt={coverAltFor(post)} style={{ aspectRatio: ratio }} className="w-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-7 text-center">
          <Kicker name={sectionFor(post)} light />
          <h2 className="mt-2 max-w-[18ch] font-display text-3xl font-bold uppercase leading-[0.98] tracking-[0.005em] text-white sm:text-4xl">
            {post.title}
          </h2>
          <Meta post={post} light />
        </div>
      </Link>
    </article>
  );
}

function ImageCard({ post, ratio = "4/3", size = 640 }: { post: Post; ratio?: string; size?: number }) {
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

export function RiotIndex({
  title,
  stat,
  posts,
  more = [],
}: {
  title: string;
  stat: string;
  posts: Post[];
  /** Recent stories from elsewhere on the site, appended so thin sections still
   * read as a full FURFUR-length river. */
  more?: Post[];
}) {
  const lead = posts.slice(0, 3);
  const feature = posts[3];
  const rail = posts.slice(4, 7);
  const row2 = posts.slice(7, 10);
  const feature2 = posts[10];
  const rest = posts.slice(11);

  return (
    <div className="container-wide px-4 pb-20 pt-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b-4 border-secondary pb-3">
        <h1 className="flex items-center gap-3 font-display text-4xl font-bold uppercase tracking-[0.03em] text-heading sm:text-5xl">
          <span aria-hidden className="h-8 w-3 shrink-0 bg-primary" />
          {title}
        </h1>
        <span className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">{stat}</span>
      </header>

      {lead.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lead.map((p) => <ImageCard key={p.id} post={p} />)}
        </div>
      )}

      {feature && (
        <section className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <HeroTile post={feature} />
          <div className="flex flex-col gap-4">
            {rail.map((p) => <SmallStory key={p.id} post={p} />)}
            <div className="relative mt-2 hidden overflow-hidden lg:block">
              <FakeAd variant="box" seed={1} />
            </div>
          </div>
        </section>
      )}

      {row2.length > 0 && (
        <div className="mt-12 grid gap-6 border-t-4 border-secondary pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {row2.map((p) => <ImageCard key={p.id} post={p} />)}
        </div>
      )}

      <div className="relative mt-12 overflow-hidden border-y border-border py-6">
        <FakeAd variant="leaderboard" seed={4} />
      </div>

      {feature2 && (
        <section className="mt-12">
          <HeroTile post={feature2} ratio="21/9" size={1600} />
        </section>
      )}

      {rest.length > 0 && (
        <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => <ImageCard key={p.id} post={p} />)}
        </div>
      )}

      {/* Site-wide river so thin sections still scroll like a FURFUR category. */}
      {more.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-center gap-3 border-b-4 border-secondary pb-2">
            <span aria-hidden className="h-4 w-2.5 bg-primary" />
            <span className="font-display text-lg font-semibold uppercase tracking-[0.08em] text-heading">More Reading</span>
          </div>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => <ImageCard key={`more-${p.id}`} post={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

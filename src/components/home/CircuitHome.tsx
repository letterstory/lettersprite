import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { publishDate, sectionFor, sectionHref } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { bylineFor } from "@/lib/author";
import { coverAltFor, coverImageFor } from "@/lib/covers";
import { FakeAd } from "@/components/FakeAd";

/**
 * Circuit front — a WIRED-style portal. A labeled leaderboard, then a
 * three-column hero (Today's Picks list │ a centered lead with two sub-stories │
 * a Trending list + box ad), then full-width section rivers headed by black tab
 * labels, with in-feed ads. Serif editorial headlines; black sans rubrics;
 * teal-blue links; thin grey rules.
 *
 * Font discipline: headlines use `font-display` (serif); rubrics, bylines, tabs
 * and labels stay on the body sans — only the hed is ever serif.
 */

/** Black rectangular tab label sitting on a thin black rule — WIRED's marker. */
function Tab({ label, href }: { label: string; href?: string }) {
  const chip = (
    <span className="inline-block bg-foreground px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-background">
      {label}
    </span>
  );
  return (
    <div className="border-t border-foreground">
      {href ? (
        <Link href={href} className="inline-block align-top transition-opacity hover:opacity-80">
          {chip}
        </Link>
      ) : (
        chip
      )}
    </div>
  );
}

/** Black uppercase category label (WIRED rubric) — sans, never colored. */
function Rubric({ section, className = "" }: { section: string; className?: string }) {
  return (
    <Link
      href={sectionHref(section)}
      className={`inline-block font-mono text-[0.64rem] font-medium uppercase tracking-[0.18em] text-heading transition-colors hover:text-primary ${className}`}
    >
      {section}
    </Link>
  );
}

function Byline({ post, className = "" }: { post: Post; className?: string }) {
  const b = bylineFor(post);
  return (
    <p className={`text-[0.66rem] uppercase tracking-[0.05em] text-muted ${className}`}>
      <Link href={`/authors/${b.slug}`} className="font-semibold text-foreground transition-colors hover:text-primary">
        {b.name}
      </Link>
      <span className="mx-1.5" aria-hidden>·</span>
      {formatDate(publishDate(post))}
    </p>
  );
}

/** Small thumbnail-left row — the Today's Picks column. */
function PickRow({ post }: { post: Post }) {
  return (
    <article className="group grid grid-cols-[64px_1fr] gap-3.5 py-4 first:pt-4">
      <Link href={`/posts/${post.slug}`} className="block aspect-square w-16 overflow-hidden bg-surfaceAlt">
        <img src={coverImageFor(post, 160)} alt={coverAltFor(post)} loading="lazy" className="h-full w-full object-cover transition-opacity group-hover:opacity-90" />
      </Link>
      <div className="min-w-0">
        <Rubric section={sectionFor(post)} />
        <Link href={`/posts/${post.slug}`}>
          <h3 className="mt-1 font-display text-[0.98rem] font-bold leading-snug text-heading transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>
        <Byline post={post} className="mt-1.5" />
      </div>
    </article>
  );
}

/** Headline-only row — the Trending / list columns. */
function TrendRow({ post }: { post: Post }) {
  return (
    <article className="group py-3.5 first:pt-4">
      <Link href={`/posts/${post.slug}`}>
        <h3 className="font-display text-[1.08rem] font-bold leading-[1.2] text-heading transition-colors group-hover:text-primary">
          {post.title}
        </h3>
      </Link>
      <Byline post={post} className="mt-1.5" />
    </article>
  );
}

/** Centered lead — the WIRED hero centerpiece. */
function Lead({ post }: { post: Post }) {
  return (
    <article className="group text-center">
      <Rubric section={sectionFor(post)} />
      <Link href={`/posts/${post.slug}`}>
        <h1 className="mx-auto mt-2 max-w-3xl font-display text-[2.9rem] font-black leading-[0.98] tracking-[-0.005em] text-heading text-balance transition-colors group-hover:text-primary sm:text-6xl md:text-[4.3rem]">
          {post.title}
        </h1>
      </Link>
      {post.dek && (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-snug text-foreground/80 text-pretty">{post.dek}</p>
      )}
      <Byline post={post} className="mt-3" />
      <Link href={`/posts/${post.slug}`} className="mt-5 block overflow-hidden bg-surfaceAlt">
        <img src={coverImageFor(post, 1200)} alt={coverAltFor(post)} fetchPriority="high" className="aspect-[16/10] w-full object-cover transition-opacity duration-300 group-hover:opacity-95" />
      </Link>
    </article>
  );
}

/** Text sub-story under the lead (rubric + hed + dek + byline, no image). */
function SubStory({ post }: { post: Post }) {
  return (
    <article className="group">
      <Rubric section={sectionFor(post)} />
      <Link href={`/posts/${post.slug}`}>
        <h3 className="mt-1 font-display text-xl font-bold leading-tight text-heading transition-colors group-hover:text-primary">
          {post.title}
        </h3>
      </Link>
      {post.dek && <p className="mt-2 line-clamp-3 text-sm leading-snug text-foreground/75">{post.dek}</p>}
      <Byline post={post} className="mt-2" />
    </article>
  );
}

/** Big image card — the feature at the head of a section river. */
function FeatureCard({ post, size = "lg" }: { post: Post; size?: "lg" | "md" }) {
  return (
    <article className="group">
      <Link href={`/posts/${post.slug}`} className="block overflow-hidden bg-surfaceAlt">
        <img src={coverImageFor(post, 720)} alt={coverAltFor(post)} loading="lazy" className="aspect-[16/9] w-full object-cover transition-opacity duration-300 group-hover:opacity-95" />
      </Link>
      <div className="mt-3">
        <Rubric section={sectionFor(post)} />
        <Link href={`/posts/${post.slug}`}>
          <h3 className={`mt-1 font-display ${size === "lg" ? "text-2xl" : "text-lg"} font-bold leading-tight text-heading transition-colors group-hover:text-primary`}>
            {post.title}
          </h3>
        </Link>
        {size === "lg" && post.dek && <p className="mt-2 text-sm leading-snug text-foreground/75">{post.dek}</p>}
        <Byline post={post} className="mt-2" />
      </div>
    </article>
  );
}

/** Thumbnail-right row for a river's side list. */
function ThumbRow({ post }: { post: Post }) {
  return (
    <article className="group grid grid-cols-[1fr_auto] gap-4 py-4 first:pt-0">
      <div className="min-w-0">
        <Rubric section={sectionFor(post)} />
        <Link href={`/posts/${post.slug}`}>
          <h4 className="mt-1 font-display text-base font-bold leading-snug text-heading transition-colors group-hover:text-primary">
            {post.title}
          </h4>
        </Link>
        <Byline post={post} className="mt-1.5" />
      </div>
      <Link href={`/posts/${post.slug}`} className="block h-16 w-20 shrink-0 overflow-hidden bg-surfaceAlt">
        <img src={coverImageFor(post, 160)} alt={coverAltFor(post)} loading="lazy" className="h-full w-full object-cover" />
      </Link>
    </article>
  );
}

/** Numbered Most Popular list for the rail — blocky mono numerals. */
function MostPopular({ posts }: { posts: Post[] }) {
  return (
    <div>
      <Tab label="Most Popular" />
      <ol className="mt-3 divide-y divide-border">
        {posts.map((p, i) => (
          <li key={p.id} className="group flex gap-3.5 py-3.5 first:pt-4">
            <span className="font-heading text-lg leading-none text-foreground/25">{i + 1}</span>
            <div className="min-w-0">
              <Rubric section={sectionFor(p)} className="text-[0.6rem]" />
              <Link href={`/posts/${p.slug}`} className="mt-0.5 block font-display text-[0.95rem] font-bold leading-snug text-heading transition-colors group-hover:text-primary">
                {p.title}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function River({ name, lead, rest }: { name: string; lead: Post; rest: Post[] }) {
  return (
    <section className="mt-9">
      <Tab label={name} href={sectionHref(name)} />
      <div className="mt-5 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <FeatureCard post={lead} />
        <div className="divide-y divide-border">
          {rest.map((p) => <ThumbRow key={p.id} post={p} />)}
        </div>
      </div>
    </section>
  );
}

/**
 * Full-bleed hero/billboard ad — WIRED's top "takeover" slot: edge-to-edge,
 * tall, a premium brand creative with a labeled "Advertisement" strip above.
 */
function HeroAd() {
  return (
    <section className="no-print w-full border-b border-border bg-[#0a0f1a]">
      <p className="py-2 text-center font-mono text-[0.58rem] uppercase tracking-[0.25em] text-white/40">
        Advertisement
      </p>
      <div className="relative mx-auto flex h-[300px] max-w-[1800px] items-center overflow-hidden sm:h-[380px] lg:h-[440px]">
        {/* Premium brand ground + motif. */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#12314a] via-[#0a0f1a] to-[#2a1c0b]" />
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.18]" preserveAspectRatio="none">
          <defs>
            <pattern id="heroad-grid" width="54" height="54" patternUnits="userSpaceOnUse">
              <path d="M54 0H0V54" fill="none" stroke="#f0c040" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroad-grid)" />
        </svg>
        <div aria-hidden className="pointer-events-none absolute -right-24 top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full border-[48px] border-[#f0c040]/15" />
        <div aria-hidden className="pointer-events-none absolute right-40 top-1/2 h-[320px] w-[320px] -translate-y-1/2 rounded-full border-[28px] border-white/10" />

        <div className="relative z-10 w-full max-w-[1800px] px-8 sm:px-14 lg:px-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[#f0c040]">
              <span className="flex h-6 w-6 items-center justify-center bg-[#f0c040] font-display text-sm font-black text-[#0a0f1a]">C</span>
              Clarus RCM
            </span>
            <p className="mt-4 font-display text-3xl font-black leading-[1.03] text-white sm:text-5xl lg:text-6xl">
              Get paid faster.<br />Denials, handled.
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
              The end-to-end revenue-cycle platform built for physician practices — appeal, recover, and prevent denials on autopilot.
            </p>
            <span className="mt-6 inline-block bg-[#f0c040] px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-[#0a0f1a]">
              Request a demo →
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CircuitHome({ posts }: { posts: Post[] }) {
  const lead = posts[0];
  const picks = posts.slice(1, 5);
  const subs = posts.slice(5, 7);
  const trending = posts.slice(7, 12);
  const sections = [...new Set(posts.map((p) => sectionFor(p)))];
  const bySection = (name: string) => posts.filter((p) => sectionFor(p) === name);
  const rivers = sections
    .map((name) => {
      const items = bySection(name);
      return items.length ? { name, lead: items[0], rest: items.slice(1, 4) } : null;
    })
    .filter(Boolean) as { name: string; lead: Post; rest: Post[] }[];
  const latest = posts.slice(18, 24);
  const railPopular = posts.slice(0, 5);
  const railLatest = posts.slice(12, 21);

  return (
    <>
      {/* Full-bleed hero/billboard takeover ad. */}
      <HeroAd />

      <div className="container-wide px-6 pb-16">
      {/* Wide editorial main + an ad-dense right rail. */}
      <div className="mt-8 grid gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <main className="min-w-0 lg:border-r lg:border-border lg:pr-10">
          {/* Two-column hero: Today's Picks │ dominant lead + sub-stories. */}
          <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[1fr_1.9fr]">
            <div className="lg:border-r lg:border-border lg:pr-8">
              <Tab label="Today's Picks" />
              <div className="divide-y divide-border">
                {picks.map((p) => <PickRow key={p.id} post={p} />)}
              </div>
            </div>
            <div>
              {lead && <Lead post={lead} />}
              {subs.length > 0 && (
                <div className="mt-7 grid gap-7 border-t border-border pt-6 text-left sm:grid-cols-2">
                  {subs.map((p) => <SubStory key={p.id} post={p} />)}
                </div>
              )}
            </div>
          </div>

          {/* Trending band. */}
          <section className="mt-9">
            <Tab label="Trending Stories" />
            <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {trending.map((p) => <TrendRow key={p.id} post={p} />)}
            </div>
          </section>

          <div className="relative my-9 overflow-hidden border-y border-border py-6">
            <FakeAd variant="leaderboard" seed={2} />
          </div>

          {/* Section rivers with in-feed ad breaks. */}
          {rivers.map((r, i) => (
            <div key={r.name}>
              <River {...r} />
              {(i === 0 || i === 2) && (
                <div className="relative my-9 overflow-hidden border-y border-border py-6">
                  <FakeAd variant="leaderboard" seed={i === 0 ? 3 : 4} />
                </div>
              )}
            </div>
          ))}

          {/* The Latest — 3-up to close. */}
          {latest.length > 0 && (
            <section className="mt-10">
              <Tab label="The Latest" />
              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-3">
                {latest.map((p) => <FeatureCard key={p.id} post={p} size="md" />)}
              </div>
            </section>
          )}
        </main>

        {/* Right rail — box ads around Most Popular and Latest. */}
        <aside className="min-w-0 space-y-9">
          <div className="relative overflow-hidden">
            <FakeAd variant="box" seed={0} />
          </div>
          <MostPopular posts={railPopular} />
          <div className="relative overflow-hidden">
            <FakeAd variant="box" seed={5} />
          </div>
          <div>
            <Tab label="Latest" />
            <div className="divide-y divide-border">
              {railLatest.map((p) => <TrendRow key={p.id} post={p} />)}
            </div>
          </div>
          {/* Sticky trailing ad — follows the scroll so the right column never
              bottoms out into blank whitespace against the longer main column. */}
          <div className="sticky top-24">
            <div className="relative overflow-hidden">
              <FakeAd variant="box" seed={2} />
            </div>
          </div>
        </aside>
      </div>
      </div>
    </>
  );
}

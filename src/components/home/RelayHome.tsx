import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { publishDate, sectionFor, sectionHref } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { bylineFor } from "@/lib/author";
import { coverAltFor, coverImageFor } from "@/lib/covers";
import { FakeAd } from "@/components/FakeAd";
import { MockPost } from "@/components/MockPost";

/**
 * Relay front — a long, dark tech-portal front (Verge-style) in the deployment's
 * own palette: a leaderboard, a hero, rule-topped section blocks, a "More
 * Stories" grid, a "Latest" grid, and Instagram + Twitter embeds, over a deep
 * right rail (stream + box ads + both social embeds + Most Popular). Built to
 * scroll long. Heavy grotesque headlines over serif deks; accent section rules.
 */

function Byline({ post, className = "" }: { post: Post; className?: string }) {
  const b = bylineFor(post);
  return (
    <p className={`font-display text-[0.66rem] font-bold uppercase tracking-[0.08em] ${className}`}>
      <Link href={`/authors/${b.slug}`} className="text-primary transition-opacity hover:opacity-70">{b.name}</Link>
      <span className="ml-2 text-muted">{formatDate(publishDate(post))}</span>
    </p>
  );
}

function BandLabel({ label }: { label: string }) {
  return (
    <div className="border-t-[3px] border-primary pt-3">
      <span className="font-display text-[0.72rem] font-bold uppercase tracking-[0.12em] text-primary">{label}</span>
    </div>
  );
}

function Hero({ post }: { post: Post }) {
  return (
    <article className="group">
      <Link href={`/posts/${post.slug}`} className="block overflow-hidden bg-surfaceAlt">
        <img src={coverImageFor(post, 1200)} alt={coverAltFor(post)} fetchPriority="high" className="aspect-[16/9] w-full object-cover transition-opacity duration-300 group-hover:opacity-95" />
      </Link>
      <div className="relative z-10 -mt-12 mr-auto w-[92%] border border-border bg-background p-5 sm:p-7">
        <Link href={`/posts/${post.slug}`}>
          <h1 className="font-display text-3xl font-extrabold leading-[1.02] tracking-[-0.01em] text-heading text-balance transition-colors group-hover:text-primary sm:text-[2.7rem]">{post.title}</h1>
        </Link>
        {post.dek && <p className="mt-3 text-lg leading-snug text-fg-soft text-pretty">{post.dek}</p>}
        <Byline post={post} className="mt-3" />
      </div>
    </article>
  );
}

function Card({ post, ratio = "16/9" }: { post: Post; ratio?: string }) {
  return (
    <article className="group">
      <Link href={`/posts/${post.slug}`} className="block overflow-hidden bg-surfaceAlt">
        <img src={coverImageFor(post, 560)} alt={coverAltFor(post)} loading="lazy" style={{ aspectRatio: ratio }} className="w-full object-cover transition-opacity duration-300 group-hover:opacity-95" />
      </Link>
      <Link href={`/posts/${post.slug}`}>
        <h3 className="mt-3 font-display text-lg font-extrabold leading-tight text-heading transition-colors group-hover:text-primary">{post.title}</h3>
      </Link>
      <Byline post={post} className="mt-2" />
    </article>
  );
}

function SectionBlock({ name, lead, rest }: { name: string; lead: Post; rest: Post[] }) {
  return (
    <section className="mt-10">
      <Link href={sectionHref(name)} className="block border-t-[3px] border-primary pt-3 transition-colors hover:text-primary">
        <h2 className="font-display text-2xl font-extrabold leading-tight text-heading">
          {name}
          {lead.dek && <span className="font-normal text-muted"> / {lead.dek}</span>}
        </h2>
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
        <article className="group">
          <Link href={`/posts/${lead.slug}`} className="block overflow-hidden bg-surfaceAlt">
            <img src={coverImageFor(lead, 720)} alt={coverAltFor(lead)} loading="lazy" className="aspect-[16/9] w-full object-cover transition-opacity duration-300 group-hover:opacity-95" />
          </Link>
          <Link href={`/posts/${lead.slug}`}>
            <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight text-heading transition-colors group-hover:text-primary">{lead.title}</h3>
          </Link>
          <Byline post={lead} className="mt-2" />
        </article>
        <div className="divide-y divide-border">
          {rest.map((p) => (
            <article key={p.id} className="group grid grid-cols-[1fr_auto] gap-4 py-4 first:pt-0">
              <div className="min-w-0">
                <Link href={`/posts/${p.slug}`}>
                  <h4 className="font-display text-base font-extrabold leading-snug text-heading transition-colors group-hover:text-primary">{p.title}</h4>
                </Link>
                {p.dek && <p className="mt-1 line-clamp-2 text-sm leading-snug text-fg-soft">{p.dek}</p>}
                <Byline post={p} className="mt-1.5" />
              </div>
              <Link href={`/posts/${p.slug}`} className="block h-16 w-20 shrink-0 overflow-hidden bg-surfaceAlt">
                <img src={coverImageFor(p, 160)} alt={coverAltFor(p)} loading="lazy" className="h-full w-full object-cover" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RailItem({ post }: { post: Post }) {
  return (
    <article className="group py-4 first:pt-0">
      <Byline post={post} />
      <Link href={`/posts/${post.slug}`}>
        <h3 className="mt-1.5 font-display text-lg font-extrabold leading-tight text-heading transition-colors group-hover:text-primary">{post.title}</h3>
      </Link>
      {post.dek && <p className="mt-1.5 line-clamp-3 text-sm leading-snug text-fg-soft">{post.dek}</p>}
    </article>
  );
}

export function RelayHome({ posts }: { posts: Post[] }) {
  const lead = posts[0];
  const twoUp = posts.slice(1, 3);
  const sections = [...new Set(posts.map((p) => sectionFor(p)))];
  const bySection = (name: string) => posts.filter((p) => sectionFor(p) === name);
  const blocks = sections
    .map((name) => {
      const items = bySection(name);
      return items.length ? { name, lead: items[0], rest: items.slice(1, 4) } : null;
    })
    .filter(Boolean) as { name: string; lead: Post; rest: Post[] }[];
  const more = posts.slice(2, 8);
  const latest = posts.slice(4, 12);
  const rail = posts.slice(3, 12);
  const igImage = coverImageFor(posts[5] ?? posts[0], 640);
  const igImage2 = coverImageFor(posts[8] ?? posts[1], 640);

  return (
    <div className="container-wide px-6 pb-16">
      <FakeAd variant="leaderboard" seed={3} className="mx-auto mt-6 max-w-4xl" />

      <div className="mt-8 grid gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main column. */}
        <main className="min-w-0 lg:border-r lg:border-border lg:pr-10">
          {lead && <Hero post={lead} />}

          <FakeAd variant="leaderboard" seed={1} className="my-9 border-y border-border py-6" />
          {/* variety spread: hero→ORBIT, then PAPERTRAIL / KETTLE / SIGNET below */}

          {twoUp.length > 0 && (
            <div className="grid gap-8 border-b border-border pb-10 sm:grid-cols-2">
              {twoUp.map((p) => <Card key={p.id} post={p} />)}
            </div>
          )}

          {blocks[0] && <SectionBlock {...blocks[0]} />}

          {/* Instagram embed band. */}
          <div className="my-9 border-y border-border py-8">
            <BandLabel label="From the community" />
            <MockPost variant="instagram" seed={0} image={igImage} className="mt-5 max-w-md" />
          </div>

          <FakeAd variant="leaderboard" seed={4} className="my-9 border-y border-border py-6" />

          {blocks[1] && <SectionBlock {...blocks[1]} />}

          {/* More stories 3-up. */}
          {more.length > 0 && (
            <section className="mt-10">
              <BandLabel label="More Stories" />
              <div className="mt-6 grid gap-8 border-b border-border pb-10 sm:grid-cols-2 lg:grid-cols-3">
                {more.map((p) => <Card key={p.id} post={p} ratio="4/3" />)}
              </div>
            </section>
          )}

          {/* Twitter embed band. */}
          <div className="my-9 border-y border-border py-8">
            <BandLabel label="On the timeline" />
            <MockPost variant="twitter" seed={1} className="mt-5 max-w-2xl" />
          </div>

          <FakeAd variant="leaderboard" seed={5} className="my-9 border-y border-border py-6" />

          {blocks[2] && <SectionBlock {...blocks[2]} />}

          {/* Latest 4-up. */}
          {latest.length > 0 && (
            <section className="mt-10">
              <BandLabel label="The Latest" />
              <div className="mt-6 grid grid-cols-2 gap-6 border-b border-border pb-10 lg:grid-cols-4">
                {latest.map((p) => <Card key={p.id} post={p} ratio="1/1" />)}
              </div>
            </section>
          )}

          <FakeAd variant="leaderboard" seed={3} className="my-9 border-y border-border py-6" />
        </main>

        {/* Right rail. */}
        <aside className="min-w-0">
          <div className="mb-4 inline-flex rounded-full bg-surfaceAlt p-1 font-display text-[0.68rem] font-bold uppercase tracking-[0.1em]">
            <span className="rounded-full bg-primary px-4 py-1.5 text-[color:var(--primary-fg)]">Latest</span>
            <Link href="/following" className="rounded-full px-4 py-1.5 text-muted transition-colors hover:text-heading">Following</Link>
          </div>

          <div className="divide-y divide-border border-t border-border">
            {rail.slice(0, 4).map((p) => <RailItem key={p.id} post={p} />)}
          </div>

          <FakeAd variant="box" seed={0} className="my-8" />
          <MockPost variant="twitter" seed={0} className="my-8" />

          <div className="divide-y divide-border border-t border-border">
            {rail.slice(4, 7).map((p) => <RailItem key={p.id} post={p} />)}
          </div>

          <MockPost variant="instagram" seed={1} image={igImage2} className="my-8" />
          <FakeAd variant="box" seed={4} className="my-8" />

          <div className="divide-y divide-border border-t border-border">
            {rail.slice(7).map((p) => <RailItem key={p.id} post={p} />)}
          </div>

          {/* Most Popular. */}
          <div className="mt-8 border-t-2 border-foreground pt-3">
            <h2 className="font-display text-[0.72rem] font-bold uppercase tracking-[0.12em] text-primary">Most Popular</h2>
            <ol className="mt-2 divide-y divide-border">
              {posts.slice(0, 5).map((p, i) => (
                <li key={p.id} className="group flex gap-3.5 py-3.5">
                  <span className="font-display text-xl font-extrabold leading-none text-primary">{i + 1}</span>
                  <Link href={`/posts/${p.slug}`} className="font-display text-base font-extrabold leading-snug text-heading transition-colors group-hover:text-primary">{p.title}</Link>
                </li>
              ))}
            </ol>
          </div>

          <FakeAd variant="box" seed={2} className="my-8" />
        </aside>
      </div>
    </div>
  );
}

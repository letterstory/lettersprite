import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { AdSlot } from "@/components/AdSlot";
import { coverImageFor, coverAltFor } from "@/lib/covers";
import {
  publishDate,
  readingTimeLabel,
  sectionFor,
  sectionHref,
} from "@/lib/editorial";
import { formatDate } from "@/lib/format";

/**
 * API Wire front — a "Details of War"-style editorial gallery: an oversized
 * display title, a rotated side label, and an asymmetric image mosaic of the
 * latest pieces, then monospace-indexed topic sections. Dark, precise, warm
 * orange/gold/teal accents; Inter headlines + Space Mono labels.
 */

const CATEGORY_COLORS: Record<string, string> = {
  "Integration Architecture": "#f5b32e",
  "API Security & Compliance": "#ea5a1f",
  "Auth & Security": "#2dd4bf",
  "API Observability": "#38bdf8",
};
const catColor = (s: string) => CATEGORY_COLORS[s] ?? "#ea5a1f";

function Chip({ section, className = "" }: { section: string; className?: string }) {
  const c = catColor(section);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.68rem] font-medium uppercase tracking-wider ${className}`}
      style={{ color: c, borderColor: `${c}55` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />
      {section}
    </span>
  );
}

function Meta({ post }: { post: Post }) {
  return (
    <span className="font-mono text-[0.7rem] uppercase tracking-wider text-muted">
      {post.author} · {formatDate(publishDate(post))} · {readingTimeLabel(post)}
    </span>
  );
}

/** A mosaic tile: the cover fills the cell, title overlaid on a gradient. */
function Tile({
  post,
  className = "",
  big = false,
}: {
  post: Post;
  className?: string;
  big?: boolean;
}) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className={`group relative overflow-hidden rounded-[1.25rem] border border-border bg-surface ${className}`}
    >      <img
        src={coverImageFor(post)}
        alt={coverAltFor(post)}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <Chip section={sectionFor(post)} className="bg-black/30 backdrop-blur-sm" />
        <h3
          className={`mt-2.5 line-clamp-3 font-display font-bold leading-tight tracking-tight text-white text-balance ${
            big ? "text-2xl sm:text-3xl" : "text-base sm:text-lg"
          }`}
        >
          {post.title}
        </h3>
        {big && (
          <p className="mt-2 hidden max-w-md text-sm text-white/70 sm:block">
            {post.dek}
          </p>
        )}
      </div>
    </Link>
  );
}

/** Refined article card for the topic blocks. */
function Card({ post }: { post: Post }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-[1.25rem] border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-primary">
      <div className="overflow-hidden">        <img
          src={coverImageFor(post)}
          alt={coverAltFor(post)}
          loading="lazy"
          className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Chip section={sectionFor(post)} className="self-start" />
        <Link href={`/posts/${post.slug}`}>
          <h3 className="line-clamp-3 font-display text-lg font-semibold leading-snug tracking-tight text-heading text-balance transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>
        {post.dek && (
          <p className="line-clamp-2 text-sm leading-relaxed text-fg-soft">{post.dek}</p>
        )}
        <div className="mt-auto border-t border-border pt-3">
          <Meta post={post} />
        </div>
      </div>
    </article>
  );
}

export function WireHome({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts;

  const groups = new Map<string, Post[]>();
  for (const p of rest) {
    const s = sectionFor(p);
    if (!groups.has(s)) groups.set(s, []);
    groups.get(s)!.push(p);
  }
  const sectionNames = [...groups.keys()];

  // Round-robin so the mosaic spans every topic.
  const mosaic: Post[] = [];
  const cursor = new Map(sectionNames.map((s) => [s, 0]));
  while (mosaic.length < 6) {
    let added = false;
    for (const s of sectionNames) {
      const arr = groups.get(s)!;
      const i = cursor.get(s)!;
      if (i < arr.length) {
        mosaic.push(arr[i]);
        cursor.set(s, i + 1);
        added = true;
        if (mosaic.length >= 6) break;
      }
    }
    if (!added) break;
  }
  const usedIds = new Set([lead?.id, ...mosaic.map((p) => p.id)]);
  const blocks = sectionNames
    .map((s) => ({
      name: s,
      posts: groups.get(s)!.filter((p) => !usedIds.has(p.id)).slice(0, 3),
    }))
    .filter((b) => b.posts.length > 0);

  // Mosaic tile spans (6-col × 3-row bento on lg; simpler on small screens).
  const spans = [
    "col-span-2 lg:col-span-3", // t1 wide
    "col-span-1 lg:col-span-2", // t2
    "col-span-1 lg:col-span-1", // t3
    "col-span-1 lg:col-span-2", // t4
    "col-span-1 lg:col-span-2", // t5
    "col-span-2 lg:col-span-2", // t6
  ];

  return (
    <div className="container-wide px-6 py-12">
      {/* Oversized display title. */}
      <section className="relative">
        <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-primary">
          ▸ The Wire
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold leading-[0.95] tracking-tight text-heading sm:text-7xl lg:text-[5.5rem]">
          APIs, in depth.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-fg-soft">
          Integration architecture, API security and observability — the
          engineering desk for teams shipping real integrations.
        </p>

        {/* Rotated side label + asymmetric mosaic. */}
        <div className="relative mt-10">
          <span className="absolute -left-4 top-24 hidden origin-top-left -rotate-90 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-muted xl:block">
            Latest dispatches
          </span>
          {lead && (
            <div className="grid grid-cols-2 gap-3 [grid-auto-rows:9rem] sm:[grid-auto-rows:11rem] lg:grid-cols-6 lg:[grid-auto-rows:14rem]">
              <Tile
                post={lead}
                big
                className="col-span-2 row-span-2 lg:col-span-3 lg:row-span-2"
              />
              {mosaic.map((p, i) => (
                <Tile key={p.id} post={p} className={spans[i] ?? "col-span-2"} />
              ))}
            </div>
          )}
        </div>
      </section>

      <AdSlot className="mt-14" minHeightClass="min-h-[90px]" />

      {/* Monospace-indexed topic blocks. */}
      {blocks.map((b, i) => (
        <section key={b.name} className="mt-16">
          <div className="mb-6 flex items-end justify-between border-b border-border pb-3">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-sm text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2
                className="font-display text-xl font-bold tracking-tight"
                style={{ color: catColor(b.name) }}
              >
                {b.name}
              </h2>
            </div>
            <Link
              href={sectionHref(b.name)}
              className="font-mono text-[0.7rem] uppercase tracking-wider text-muted transition-colors hover:text-primary"
            >
              View all →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {b.posts.map((p) => (
              <Card key={p.id} post={p} />
            ))}
          </div>
          {i === 0 && <AdSlot className="mt-14" minHeightClass="min-h-[90px]" />}
        </section>
      ))}

      {/* Newsletter. */}
      <section
        id="newsletter"
        className="mt-20 scroll-mt-24 rounded-[1.75rem] border border-border bg-surface p-8 text-center sm:p-14"
      >
        <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary">
          ▸ The Payload
        </span>
        <h2 className="mx-auto mt-3 max-w-xl font-display text-2xl font-bold tracking-tight text-heading sm:text-3xl">
          API design, security and observability, in your inbox weekly.
        </h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-fg-soft">
          One concise brief on integration architecture and API security. No noise.
        </p>
        <form className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
          <input
            type="email"
            placeholder="you@company.com"
            aria-label="Email address"
            className="w-full flex-1 rounded-full border border-border bg-background px-5 py-3 font-mono text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            className="rounded-full bg-primary px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[color:var(--primary-fg)] transition-opacity hover:opacity-90"
          >
            Subscribe
          </button>
        </form>
      </section>

      <AdSlot className="mt-16" minHeightClass="min-h-[90px]" />
    </div>
  );
}

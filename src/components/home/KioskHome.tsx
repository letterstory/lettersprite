import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { AdSlot } from "@/components/AdSlot";
import { sectionFor, sectionHref } from "@/lib/editorial";
import { coverAltFor, coverImageFor } from "@/lib/covers";
import { bylineFor } from "@/lib/author";

/**
 * Kiosk front — a take on tastecooking.com: a warm cream newsstand with an
 * asymmetric hero (bold serif headline left, cover art right), alternating
 * image/text feature rows, full-bleed promo colour bands with black buttons,
 * a "More reading" card row, and a "Recent articles" grid whose covers sit in
 * vivid per-section colour mats. Bylines read "Story: NAME". Rendered in
 * techfounderwriting's brand red on Taste's cream base.
 */

// Per-section accent colours (Taste's playful category palette), keyed to
// techfounderwriting's sections with a stable hashed fallback for the rest.
const SECTION_COLORS: Record<string, string> = {
  "Auth and Security": "#c0392b",
  "Integration Architecture": "#2a7d6f",
  "Build vs Buy Decisions": "#d98a1f",
  Features: "#6d5aa6",
};
const PALETTE = ["#c0392b", "#2a7d6f", "#d98a1f", "#6d5aa6", "#2f6690", "#b8543a"];
function sectionColor(section: string): string {
  if (SECTION_COLORS[section]) return SECTION_COLORS[section];
  let h = 0;
  for (let i = 0; i < section.length; i++) h = (h * 31 + section.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function Kicker({ post, className = "" }: { post: Post; className?: string }) {
  const s = sectionFor(post);
  return (
    <Link
      href={sectionHref(s)}
      className={`font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-70 ${className}`}
      style={{ color: sectionColor(s) }}
    >
      {s}
    </Link>
  );
}

function Byline({ post, muted = true }: { post: Post; muted?: boolean }) {
  const b = bylineFor(post);
  return (
    <p
      className={`font-mono text-[0.68rem] uppercase tracking-[0.12em] ${muted ? "text-muted" : "text-current/70"}`}
    >
      Story:{" "}
      <Link
        href={`/authors/${b.slug}`}
        className={muted ? "text-heading transition-colors hover:text-primary" : "underline underline-offset-2"}
      >
        {b.name}
      </Link>
    </p>
  );
}

function BlackButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-block self-start bg-foreground px-6 py-3 font-mono text-[0.74rem] font-bold uppercase tracking-[0.14em] text-background transition-colors hover:bg-primary"
    >
      {children}
    </Link>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-9 flex items-center gap-5">
      <span className="h-px flex-1 bg-border" />
      <h2 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-heading">{children}</h2>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/** A section kicker sitting on a hairline rule that runs to the edge. */
function KickerRule({ post }: { post: Post }) {
  const s = sectionFor(post);
  return (
    <div className="mb-4 flex items-center gap-4">
      <Link
        href={sectionHref(s)}
        className="shrink-0 font-mono text-[0.72rem] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
        style={{ color: sectionColor(s) }}
      >
        {s}
      </Link>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/** The lead: full-color cover on top, then kicker-rule + headline + dek below. */
function Hero({ post }: { post: Post }) {
  return (
    <article className="group container-wide px-6 pb-8 pt-8">
      <Link href={`/posts/${post.slug}`} className="block overflow-hidden">
        <img
          src={coverImageFor(post, 1200)}
          alt={coverAltFor(post)}
          className="mx-auto max-h-[20rem] w-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </Link>
      <div className="mt-6">
        <KickerRule post={post} />
        <Link href={`/posts/${post.slug}`}>
          <h1 className="font-display text-[2.6rem] font-black leading-[1.02] tracking-[-0.01em] text-heading text-balance transition-colors group-hover:text-primary sm:text-6xl">
            <span className="box-decoration-clone bg-[linear-gradient(to_top,rgba(224,161,42,0.28)_0.42em,transparent_0.42em)] px-0.5">
              {post.title}
            </span>
          </h1>
        </Link>
        {post.dek && (
          <p className="mt-5 max-w-2xl text-xl leading-relaxed text-fg-soft">{post.dek}</p>
        )}
        <div className="mt-5">
          <Byline post={post} />
        </div>
      </div>
    </article>
  );
}

/** An alternating image/text feature row. */
function FeatureRow({ post, flip }: { post: Post; flip?: boolean }) {
  return (
    <article className="group grid items-center gap-8 border-t border-border py-14 md:grid-cols-2 md:gap-12">
      <Link
        href={`/posts/${post.slug}`}
        className={`block overflow-hidden bg-surfaceAlt ${flip ? "md:order-2" : ""}`}
        style={{ aspectRatio: "3/2" }}
      >
        <img
          src={coverImageFor(post, 900)}
          alt={coverAltFor(post)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <div className={flip ? "md:order-1" : ""}>
        <KickerRule post={post} />
        <Link href={`/posts/${post.slug}`}>
          <h2 className="font-display text-3xl font-black leading-[1.05] tracking-[-0.01em] text-heading text-balance transition-colors group-hover:text-primary sm:text-[2.4rem]">
            {post.title}
          </h2>
        </Link>
        {post.dek && (
          <p className="mt-3 max-w-md text-lg leading-relaxed text-fg-soft">{post.dek}</p>
        )}
        <div className="mt-4">
          <Byline post={post} />
        </div>
      </div>
    </article>
  );
}

/** A full-bleed promo band: cover left, solid colour panel right. */
function PromoBand({ post, color, light }: { post: Post; color: string; light?: boolean }) {
  const text = light ? "text-heading" : "text-white";
  const sub = light ? "text-heading/65" : "text-white/85";
  return (
    <section className="group my-10 grid md:grid-cols-2">
      <Link
        href={`/posts/${post.slug}`}
        className="block min-h-[15rem] overflow-hidden bg-surfaceAlt md:min-h-[22rem]"
      >
        <img
          src={coverImageFor(post, 1100)}
          alt={coverAltFor(post)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-col justify-center gap-4 p-10 sm:p-14" style={{ backgroundColor: color }}>
        <span className={`font-mono text-[0.72rem] font-bold uppercase tracking-[0.18em] ${sub}`}>
          {sectionFor(post)}
        </span>
        <Link href={`/posts/${post.slug}`}>
          <h2 className={`font-display text-3xl font-black leading-[1.05] text-balance sm:text-[2.6rem] ${text}`}>
            {post.title}
          </h2>
        </Link>
        {post.dek && <p className={`max-w-md leading-relaxed ${sub}`}>{post.dek}</p>}
        <BlackButton href={`/posts/${post.slug}`}>Read →</BlackButton>
      </div>
    </section>
  );
}

/** A full-width spotlight: the cover art shown large and uncropped, text beside. */
function Spotlight({ post }: { post: Post }) {
  const c = sectionColor(sectionFor(post));
  return (
    <section className="group my-10 border-y border-border bg-surfaceAlt">
      <div className="container-wide grid items-center gap-8 px-6 py-12 md:grid-cols-5 md:gap-12 md:py-16">
        <Link
          href={`/posts/${post.slug}`}
          className="order-2 flex items-center justify-center md:order-1 md:col-span-3"
        >
          <span className="block border-4 bg-background p-4 sm:p-6" style={{ borderColor: c }}>
            <img
              src={coverImageFor(post, 1200)}
              alt={coverAltFor(post)}
              className="mx-auto max-h-[24rem] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </span>
        </Link>
        <div className="order-1 md:order-2 md:col-span-2">
          <span
            className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.18em]"
            style={{ color: c }}
          >
            Spotlight
          </span>
          <Link href={`/posts/${post.slug}`}>
            <h2 className="mt-3 font-display text-3xl font-black leading-[1.05] tracking-[-0.01em] text-heading text-balance transition-colors group-hover:text-primary sm:text-[2.5rem]">
              {post.title}
            </h2>
          </Link>
          {post.dek && (
            <p className="mt-4 text-lg leading-relaxed text-fg-soft">{post.dek}</p>
          )}
          <div className="mt-5 flex flex-col gap-4">
            <Byline post={post} />
            <BlackButton href={`/posts/${post.slug}`}>Read →</BlackButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A grid card with the cover in a vivid section-colour mat. */
function MatCard({ post }: { post: Post }) {
  const c = sectionColor(sectionFor(post));
  return (
    <article className="group flex flex-col">
      <Link href={`/posts/${post.slug}`} className="block p-3" style={{ backgroundColor: c }}>
        <span className="block overflow-hidden" style={{ aspectRatio: "3/2" }}>
          <img
            src={coverImageFor(post, 700)}
            alt={coverAltFor(post)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </span>
      </Link>
      <div className="pt-4">
        <Kicker post={post} className="mb-2 inline-block" />
        <Link href={`/posts/${post.slug}`}>
          <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-heading text-balance transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>
        {post.dek && (
          <p className="mt-2 line-clamp-3 text-[0.95rem] leading-relaxed text-fg-soft">{post.dek}</p>
        )}
        <div className="mt-3">
          <Byline post={post} />
        </div>
      </div>
    </article>
  );
}

/** A plain grid card: bare cover, kicker, serif headline, byline. */
function PlainCard({ post }: { post: Post }) {
  return (
    <article className="group flex flex-col">
      <Link href={`/posts/${post.slug}`} className="block overflow-hidden bg-surfaceAlt" style={{ aspectRatio: "3/2" }}>
        <img
          src={coverImageFor(post, 700)}
          alt={coverAltFor(post)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </Link>
      <div className="pt-4">
        <Kicker post={post} className="mb-2 inline-block" />
        <Link href={`/posts/${post.slug}`}>
          <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-heading text-balance transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>
        {post.dek && (
          <p className="mt-2 line-clamp-2 text-[0.9rem] leading-relaxed text-fg-soft">{post.dek}</p>
        )}
        <div className="mt-3">
          <Byline post={post} />
        </div>
      </div>
    </article>
  );
}

export function KioskHome({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts;
  const feats = rest.slice(0, 3);
  const spotlight = rest[3];
  const promoA = rest[4];
  const midRow = rest.slice(5, 8);
  const promoB = rest[8];
  const recent = rest.slice(9, 15);
  const tail = rest.slice(15, 18);

  return (
    <div>
      {lead && <Hero post={lead} />}

      {feats.length > 0 && (
        <section className="container-wide px-6">
          {feats.map((p, i) => (
            <FeatureRow key={p.id} post={p} flip={i % 2 === 1} />
          ))}
        </section>
      )}

      {spotlight && <Spotlight post={spotlight} />}

      {promoA && <PromoBand post={promoA} color="#e0a12a" light />}

      {midRow.length > 0 && (
        <section className="container-wide px-6 py-16">
          <SectionHeading>More reading</SectionHeading>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {midRow.map((p) => (
              <PlainCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      {promoB && <PromoBand post={promoB} color="#c0392b" />}

      {recent.length > 0 && (
        <section className="container-wide px-6 py-16">
          <SectionHeading>Recent articles</SectionHeading>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((p) => (
              <MatCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      {tail.length > 0 && (
        <section className="container-wide px-6 pb-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {tail.map((p) => (
              <PlainCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      <div className="container-wide px-6 pb-14">
        <AdSlot minHeightClass="min-h-[90px]" />
      </div>
    </div>
  );
}

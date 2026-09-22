import Link from "@/components/Link";
import { env } from "@/env";
import type { Post } from "@/lib/letterbrace/types";
import { publishDate, sectionFor } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { bylineFor } from "@/lib/author";
import { coverAltFor, coverImageFor } from "@/lib/covers";
import { FakeAd } from "@/components/FakeAd";

/**
 * Flux section/author index — a bold tech-portal category page: a colored banner
 * with the section name set huge, a Follow pill + description, a two-up hero, a
 * "Latest in …" stream with interspersed ads, and a right rail with a tall ad +
 * a numbered Most Popular list. All in the deployment's own palette, with static
 * invented ad creatives.
 */

function Byline({ post, className = "" }: { post: Post; className?: string }) {
  const b = bylineFor(post);
  return (
    <p className={`font-display text-[0.66rem] font-bold uppercase tracking-[0.08em] ${className}`}>
      <Link href={`/authors/${b.slug}`} className="text-primary transition-opacity hover:opacity-70">
        {b.name}
      </Link>
      <span className="ml-2 text-muted">{formatDate(publishDate(post))}</span>
    </p>
  );
}

function BigCard({ post }: { post: Post }) {
  return (
    <article className="group">
      <Link href={`/posts/${post.slug}`} className="block overflow-hidden bg-surfaceAlt">
        <img
          src={coverImageFor(post, 720)}
          alt={coverAltFor(post)}
          className="aspect-[16/10] w-full object-cover transition-opacity duration-300 group-hover:opacity-95"
        />
      </Link>
      <Link href={`/posts/${post.slug}`}>
        <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight text-heading text-balance transition-colors group-hover:text-primary sm:text-[1.7rem]">
          {post.title}
        </h2>
      </Link>
      {post.dek && (
        <p className="mt-2 leading-snug text-fg-soft text-pretty">{post.dek}</p>
      )}
      <Byline post={post} className="mt-2" />
    </article>
  );
}

function StreamItem({ post }: { post: Post }) {
  return (
    <article className="group py-6 first:pt-5">
      <Byline post={post} />
      <Link href={`/posts/${post.slug}`}>
        <h3 className="mt-2 font-display text-xl font-extrabold leading-tight text-heading transition-colors group-hover:text-primary">
          {post.title}
        </h3>
      </Link>
      {post.dek && (
        <p className="mt-2 max-w-2xl leading-relaxed text-fg-soft">{post.dek}</p>
      )}
    </article>
  );
}

export function FluxIndex({
  title,
  stat,
  posts,
}: {
  title: string;
  stat?: string;
  posts: Post[];
  siblings?: { label: string; href: string }[];
}) {
  const [heroA, heroB, ...rest] = posts;
  const popular = posts.slice(0, 5);

  return (
    <div className="pb-16">
      {/* Colored banner with the section name set huge. */}
      <div
        className="text-[color:var(--primary-fg)]"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <div className="container-wide overflow-hidden px-6 pb-6 pt-10">
          <h1
            className="font-display font-extrabold uppercase leading-[0.85] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.5rem, 9vw, 7rem)", color: "var(--primary-fg)" }}
          >
            {title}
          </h1>
        </div>
      </div>

      <div className="container-wide px-6">
        {/* Follow + description. */}
        <div className="flex flex-col gap-4 border-b-2 border-foreground py-7">
          <span
            className="inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.08em] text-[color:var(--fg)]"
            style={{ backgroundColor: "var(--accent)" }}
          >
            + Follow
          </span>
          <p className="max-w-3xl text-lg leading-relaxed text-fg-soft">
            The latest in {title} — reports, playbooks, and analysis from{" "}
            {env.siteTitle}.
            {stat ? ` ${stat}.` : ""}
          </p>
        </div>

        {/* Two-up hero. */}
        {(heroA || heroB) && (
          <div className="grid gap-8 border-b border-border py-10 md:grid-cols-2">
            {heroA && <BigCard post={heroA} />}
            {heroB && <BigCard post={heroB} />}
          </div>
        )}

        {/* Stream + right rail. */}
        <div className="grid gap-x-10 gap-y-10 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0 lg:border-r lg:border-border lg:pr-10">
            <div className="border-t-2 border-primary pt-2">
              <span className="font-display text-[0.72rem] font-bold uppercase tracking-[0.12em] text-primary">
                Latest in {title}
              </span>
            </div>
            <div className="divide-y divide-border">
              {rest.map((post, i) => (
                <div key={post.id}>
                  <StreamItem post={post} />
                  {(i === 1 || i === 4) && (
                    <FakeAd
                      variant="box"
                      seed={i + 2}
                      className="my-6 border-y border-border py-6"
                    />
                  )}
                </div>
              ))}
            </div>
          </main>

          <aside className="min-w-0">
            <FakeAd variant="box" seed={1} className="lg:sticky lg:top-6" />

            <div className="mt-10 border-t-2 border-foreground pt-3">
              <h2 className="font-display text-[0.72rem] font-bold uppercase tracking-[0.12em] text-primary">
                Most Popular
              </h2>
              <ol className="mt-2 divide-y divide-border">
                {popular.map((post, i) => (
                  <li key={post.id} className="group flex gap-3.5 py-4">
                    <span className="font-display text-xl font-extrabold leading-none text-primary">
                      {i + 1}
                    </span>
                    <Link
                      href={`/posts/${post.slug}`}
                      className="font-display text-base font-extrabold leading-snug text-heading transition-colors group-hover:text-primary"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

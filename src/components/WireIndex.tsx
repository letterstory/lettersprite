import { Fragment, type ReactNode } from "react";
import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { Cover } from "@/components/Story";
import { AdSlot } from "@/components/AdSlot";
import { publishDate, readingTimeLabel, sectionFor } from "@/lib/editorial";
import { formatDate } from "@/lib/format";

/**
 * ctrl.xyz-style index for section & author pages: an airy header (mono eyebrow,
 * oversized Inter title, a rounded-full pill row of related links) over a roomy
 * grid of big rounded cards, with ad zones woven in. Dark palette + orange/gold.
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
      className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-[0.7rem] font-medium uppercase tracking-wider ${className}`}
      style={{ color: c, borderColor: `${c}55` }}
    >
      {section}
    </span>
  );
}

function Meta({ post }: { post: Post }) {
  return (
    <span className="font-mono text-xs text-muted">
      {post.author} · {formatDate(publishDate(post))} · {readingTimeLabel(post)}
    </span>
  );
}

export function WireIndex({
  eyebrow,
  title,
  stat,
  chips = [],
  avatar,
  posts,
  footer,
}: {
  eyebrow: string;
  title: string;
  stat?: string;
  chips?: { label: string; href: string }[];
  avatar?: { initials: string; color: string };
  posts: Post[];
  footer?: ReactNode;
}) {
  return (
    <div className="container-wide px-6 py-12">
      {/* Header. */}
      <header className="border-b border-border pb-10">
        <div className="flex items-center gap-4">
          {avatar && (
            <span
              className="avatar h-14 w-14 shrink-0 rounded-full text-lg"
              style={{ backgroundColor: avatar.color }}
              aria-hidden
            >
              {avatar.initials}
            </span>
          )}
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-heading sm:text-5xl">
              {title}
            </h1>
          </div>
        </div>
        {stat && <p className="mt-4 font-mono text-sm text-muted">{stat}</p>}
        {chips.length > 0 && (
          <nav className="mt-6 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="rounded-full border border-border px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:border-primary hover:text-primary"
              >
                {c.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Card grid, with an in-feed ad. */}
      <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, idx) => (
          <Fragment key={p.id}>
            <article className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-border bg-surface transition-colors hover:border-primary">
              <Cover post={p} ratio="16/9" rounded={false} priority={idx === 0} />
              <div className="flex flex-1 flex-col p-6">
                <Chip section={sectionFor(p)} className="self-start" />
                <Link href={`/posts/${p.slug}`}>
                  <h2 className="mt-4 font-display text-xl font-semibold leading-snug text-heading text-balance transition-colors group-hover:text-primary">
                    {p.title}
                  </h2>
                </Link>
                {p.dek && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-fg-soft">
                    {p.dek}
                  </p>
                )}
                <div className="mt-auto pt-5">
                  <Meta post={p} />
                </div>
              </div>
            </article>
            {idx === 2 && (
              <div className="sm:col-span-2 lg:col-span-3">
                <AdSlot minHeightClass="min-h-[120px]" />
              </div>
            )}
          </Fragment>
        ))}
      </div>

      <AdSlot className="mt-12" minHeightClass="min-h-[90px]" />

      {footer && <div className="mt-12 flex justify-center">{footer}</div>}
    </div>
  );
}

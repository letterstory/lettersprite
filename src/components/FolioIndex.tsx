import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { publishDate, sectionFor, sectionHref } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { makeCovers } from "@/lib/stock-covers";

/**
 * Folio (grafill) section/author index: a category switcher — the current
 * category set large in the centre with the sibling categories as pill links
 * flanking it — over a two-column grid of big cards (image on top, a bordered
 * box below with a coloured category dot, date, uppercase headline, and dek).
 */

const DOT: Record<string, string> = {
  Accounting: "#1a7f5a",
  "Expense management": "#44a8c1",
  "Accounts payable": "#d4a017",
  "Finance teams": "#1a7f5a",
  "Financial planning": "#44a8c1",
};
const dot = (s: string) => DOT[s] ?? "#1a7f5a";

function Pill({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded border border-border px-4 py-2 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-heading transition-colors hover:border-primary hover:text-primary"
    >
      {label}
    </Link>
  );
}

function BigCard({
  post,
  cover,
  featured,
}: {
  post: Post;
  cover: string;
  featured?: boolean;
}) {
  const section = sectionFor(post);
  return (
    <article className="group flex flex-col">
      <Link
        href={`/posts/${post.slug}`}
        className="block w-full overflow-hidden"
        style={{ aspectRatio: "16/10" }}
      >
        <img
          src={cover}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
        />
      </Link>
      <div
        className={`-mt-px border bg-surface p-6 sm:p-7 ${featured ? "border-primary" : "border-border"}`}
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: dot(section) }}
          />
          <Link
            href={sectionHref(section)}
            className="font-sans text-[0.68rem] font-bold uppercase tracking-[0.12em] text-heading transition-colors hover:text-primary"
          >
            {section}
          </Link>
          <span className="font-sans text-[0.68rem] uppercase tracking-[0.1em] text-muted">
            {formatDate(publishDate(post))}
          </span>
        </div>
        <Link href={`/posts/${post.slug}`}>
          <h2 className="font-display text-xl font-bold uppercase leading-tight tracking-tight text-heading text-balance transition-colors group-hover:text-primary sm:text-2xl">
            {post.title}
          </h2>
        </Link>
        {post.dek && (
          <p className="mt-3 text-[0.95rem] leading-relaxed text-fg-soft">
            {post.dek}
          </p>
        )}
      </div>
    </article>
  );
}

export function FolioIndex({
  title,
  siblings,
  stat,
  posts,
}: {
  title: string;
  siblings: { label: string; href: string }[];
  stat: string;
  posts: Post[];
}) {
  const covers = makeCovers(posts);
  const cv = (slug: string) => covers.get(slug) ?? "";
  const half = Math.ceil(siblings.length / 2);
  const left = siblings.slice(0, half);
  const right = siblings.slice(half);

  return (
    <div className="container-wide px-6 py-10">
      {/* Category switcher: siblings as pills flanking the current category. */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
        {left.map((s) => (
          <Pill key={s.href} {...s} />
        ))}
        <h1 className="px-2 text-center font-display text-4xl font-extrabold uppercase tracking-tight text-heading sm:text-5xl">
          {title}
        </h1>
        {right.map((s) => (
          <Pill key={s.href} {...s} />
        ))}
      </div>
      <p className="mb-10 border-b border-border pb-8 text-center font-sans text-sm text-muted">
        {stat}
      </p>

      {/* Two-column big-card grid. */}
      <div className="grid gap-8 lg:grid-cols-2">
        {posts.map((p, i) => (
          <BigCard key={p.id} post={p} cover={cv(p.slug)} featured={i === 0} />
        ))}
      </div>
    </div>
  );
}

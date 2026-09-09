import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { sectionFor, sectionHref } from "@/lib/editorial";
import { coverAltFor, coverImageFor } from "@/lib/covers";
import { bylineFor } from "@/lib/author";

/**
 * Kiosk (Taste) section/author index: a centered title with flanking rules and
 * the sibling categories as small nav links beneath, over a clean three-column
 * grid of cards (cover, coloured kicker, bold serif headline, dek, "Story:"
 * byline) — lots of cream whitespace, no card borders.
 */

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

function Card({ post }: { post: Post }) {
  const s = sectionFor(post);
  const b = bylineFor(post);
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
        <Link
          href={sectionHref(s)}
          className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
          style={{ color: sectionColor(s) }}
        >
          {s}
        </Link>
        <Link href={`/posts/${post.slug}`}>
          <h2 className="mt-2 font-display text-xl font-bold leading-tight tracking-tight text-heading text-balance transition-colors group-hover:text-primary">
            {post.title}
          </h2>
        </Link>
        {post.dek && (
          <p className="mt-2 line-clamp-3 text-[0.95rem] leading-relaxed text-fg-soft">{post.dek}</p>
        )}
        <p className="mt-3 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-muted">
          Story:{" "}
          <Link href={`/authors/${b.slug}`} className="text-heading transition-colors hover:text-primary">
            {b.name}
          </Link>
        </p>
      </div>
    </article>
  );
}

export function KioskIndex({
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
  return (
    <div className="container-wide px-6 py-12">
      {/* Centered title with flanking rules. */}
      <div className="mb-4 flex items-center gap-6">
        <span className="h-px flex-1 bg-border" />
        <h1 className="text-center font-display text-4xl font-black tracking-tight text-heading sm:text-5xl">
          {title}
        </h1>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Sibling categories as small nav links. */}
      {siblings.length > 0 && (
        <nav className="mb-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {siblings.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted transition-colors hover:text-primary"
            >
              {s.label}
            </Link>
          ))}
        </nav>
      )}
      <p className="mb-12 text-center font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">
        {stat}
      </p>

      {/* Three-column card grid. */}
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Card key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}

import Link from "@/components/Link";
import type { Post } from "@/lib/letterbrace/types";
import { AdSlot } from "@/components/AdSlot";
import { publishDate, sectionFor, sectionHref } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { coverAltFor, coverImageFor } from "@/lib/covers";

/**
 * Vitrine front — a take on franklinazzi.fr: a dense, quiet multi-column grid of
 * cover images on warm off-white, each with a small understated caption (section
 * kicker + title) beneath so it reads as a mature blog rather than a caption-less
 * portfolio. Monochrome UI; the cover art carries the colour. The first item is a
 * slightly larger lead for a touch of editorial hierarchy.
 */

function Caption({ post }: { post: Post }) {
  const section = sectionFor(post);
  return (
    <div className="mt-3">
      <Link
        href={sectionHref(section)}
        className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted transition-colors hover:text-primary"
      >
        {section}
      </Link>
      <Link href={`/posts/${post.slug}`}>
        <h3 className="mt-1.5 text-[0.98rem] font-medium leading-snug tracking-[-0.01em] text-heading text-balance transition-colors group-hover:text-primary">
          {post.title}
        </h3>
      </Link>
    </div>
  );
}

function Cell({ post }: { post: Post }) {
  return (
    <article className="group flex flex-col">
      <Link
        href={`/posts/${post.slug}`}
        className="block overflow-hidden bg-surfaceAlt"
        style={{ aspectRatio: "16/10" }}
      >
        <img
          src={coverImageFor(post, 700)}
          alt={coverAltFor(post)}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
        />
      </Link>
      <Caption post={post} />
    </article>
  );
}

/** The lead: a wider feature with a dek + dateline, still quiet. */
function Lead({ post }: { post: Post }) {
  const section = sectionFor(post);
  return (
    <article className="group sm:col-span-2 lg:col-span-2">
      <Link
        href={`/posts/${post.slug}`}
        className="block overflow-hidden bg-surfaceAlt"
        style={{ aspectRatio: "16/9" }}
      >
        <img
          src={coverImageFor(post, 1100)}
          alt={coverAltFor(post)}
          className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.02]"
        />
      </Link>
      <div className="mt-4">
        <div className="flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted">
          <Link href={sectionHref(section)} className="transition-colors hover:text-primary">
            {section}
          </Link>
          <span aria-hidden>·</span>
          <span>{formatDate(publishDate(post))}</span>
        </div>
        <Link href={`/posts/${post.slug}`}>
          <h2 className="mt-2 max-w-2xl text-2xl font-semibold leading-[1.15] tracking-[-0.02em] text-heading text-balance transition-colors group-hover:text-primary sm:text-[1.7rem]">
            {post.title}
          </h2>
        </Link>
        {post.dek && (
          <p className="mt-2 max-w-xl text-[0.98rem] leading-relaxed text-fg-soft">{post.dek}</p>
        )}
      </div>
    </article>
  );
}

export function VitrineHome({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts;

  return (
    <div className="container-wide px-6 pt-4 pb-16">
      {/* Understated section label, echoing Franklin Azzi's "Selection" tab. */}
      <div className="mb-8 border-b border-border pb-3">
        <span className="font-mono text-[0.64rem] uppercase tracking-[0.2em] text-heading">
          Selection
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-y-12 lg:grid-cols-4">
        {lead && <Lead post={lead} />}
        {rest.map((p) => (
          <Cell key={p.id} post={p} />
        ))}
      </div>

      <div className="mt-16">
        <AdSlot minHeightClass="min-h-[90px]" />
      </div>
    </div>
  );
}

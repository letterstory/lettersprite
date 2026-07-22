import Link from "next/link";
import type { Post } from "@/lib/letterbrace/types";
import { coverAltFor, coverImageFor } from "@/lib/covers";
import { Kicker } from "./Kicker";
import { PostMeta } from "./PostMeta";

/**
 * Composable story building blocks used by the homepage layouts. Keeping them
 * here (rather than one card per layout) lets each front page mix sizes freely
 * — a lead, a couple of features, a river of rows, a ruled headline column —
 * the way a real section front does.
 */

type Ratio = "16/9" | "3/2" | "4/3" | "4/5" | "1/1";

const RATIO: Record<Ratio, string> = {
  "16/9": "aspect-[16/9]",
  "3/2": "aspect-[3/2]",
  "4/3": "aspect-[4/3]",
  "4/5": "aspect-[4/5]",
  "1/1": "aspect-square",
};

/** A cover image with a subtle zoom-on-hover, wrapped in a link. */
export function Cover({
  post,
  ratio = "16/9",
  className = "",
  priority = false,
  rounded = true,
}: {
  post: Post;
  ratio?: Ratio;
  className?: string;
  priority?: boolean;
  rounded?: boolean;
}) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      tabIndex={-1}
      aria-hidden
      className={`block overflow-hidden bg-surface ${
        rounded ? "rounded-[var(--radius)]" : ""
      } ${className}`}
    >
      <img
        src={coverImageFor(post)}
        alt={coverAltFor(post)}
        loading={priority ? "eager" : "lazy"}
        className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] ${RATIO[ratio]}`}
      />
    </Link>
  );
}

/** Headline link that shifts to the brand color on hover. */
function Headline({
  post,
  className,
  display = false,
  level = 3,
}: {
  post: Post;
  className: string;
  display?: boolean;
  level?: 2 | 3;
}) {
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <Link href={`/posts/${post.slug}`} className="headline-link">
      <Tag className={`${display ? "display" : "font-heading"} ${className}`}>
        {post.title}
      </Tag>
    </Link>
  );
}

/** The dominant hero story: big image, big display headline, dek and byline. */
export function LeadStory({
  post,
  kicker = true,
  ratio = "16/9",
}: {
  post: Post;
  kicker?: boolean;
  ratio?: Ratio;
}) {
  return (
    <article className="group flex flex-col gap-4">
      <Cover post={post} ratio={ratio} priority />
      <div className="flex flex-col gap-3">
        {kicker && <Kicker post={post} />}
        <Headline
          post={post}
          display
          level={2}
          className="text-3xl font-black leading-[1.05] sm:text-4xl md:text-5xl"
        />
        {post.dek && (
          <p className="max-w-2xl text-lg leading-relaxed text-fg-soft excerpt-clamp-3">
            {post.dek}
          </p>
        )}
        <PostMeta post={post} variant="byline" readingTime className="mt-1" />
      </div>
    </article>
  );
}

/** A standard story card (image on top). `size` scales the headline. */
export function StoryCard({
  post,
  size = "md",
  kicker = true,
  dek = true,
  ratio = "16/9",
  meta = true,
  headingLevel = 3,
}: {
  post: Post;
  size?: "sm" | "md" | "lg";
  kicker?: boolean;
  dek?: boolean;
  ratio?: Ratio;
  meta?: boolean;
  headingLevel?: 2 | 3;
}) {
  const headlineCls =
    size === "lg"
      ? "text-2xl font-bold leading-tight sm:text-3xl"
      : size === "sm"
        ? "text-base font-bold leading-snug"
        : "text-xl font-bold leading-snug";
  return (
    <article className="group flex flex-col gap-3">
      <Cover post={post} ratio={ratio} />
      {kicker && <Kicker post={post} className="mt-1" />}
      <Headline
        post={post}
        display={size === "lg"}
        level={headingLevel}
        className={headlineCls}
      />
      {dek && post.dek && (
        <p
          className={`text-fg-soft ${
            size === "sm" ? "text-sm excerpt-clamp-2" : "excerpt-clamp-3"
          }`}
        >
          {post.dek}
        </p>
      )}
      {meta && (
        <PostMeta post={post} className="mt-auto pt-1 text-xs" />
      )}
    </article>
  );
}

/** A horizontal feed row: thumbnail beside the headline (TechCrunch/Axios). */
export function StoryRow({
  post,
  thumb = true,
  dek = false,
  headingLevel = 3,
}: {
  post: Post;
  thumb?: boolean;
  dek?: boolean;
  headingLevel?: 2 | 3;
}) {
  return (
    <article className="group flex gap-4 sm:gap-6">
      {thumb && (
        <Cover
          post={post}
          ratio="4/3"
          className="w-28 shrink-0 sm:w-44 md:w-52"
        />
      )}
      <div className="flex min-w-0 flex-col gap-1.5">
        <Kicker post={post} />
        <Headline
          post={post}
          level={headingLevel}
          className="text-lg font-bold leading-snug sm:text-xl"
        />
        {dek && post.dek && (
          <p className="hidden text-sm text-fg-soft excerpt-clamp-2 sm:block">
            {post.dek}
          </p>
        )}
        <PostMeta post={post} className="text-xs" />
      </div>
    </article>
  );
}

/** A compact, text-only ruled headline (broadsheet columns, rails, "more"). */
export function HeadlineItem({
  post,
  dek = false,
  kicker = true,
  headingLevel = 3,
}: {
  post: Post;
  dek?: boolean;
  kicker?: boolean;
  headingLevel?: 2 | 3;
}) {
  return (
    <article className="group flex flex-col gap-1.5">
      {kicker && <Kicker post={post} />}
      <Headline
        post={post}
        level={headingLevel}
        className="text-lg font-bold leading-snug"
      />
      {dek && post.dek && (
        <p className="text-sm text-fg-soft excerpt-clamp-2">{post.dek}</p>
      )}
      <PostMeta post={post} className="text-xs" />
    </article>
  );
}

/** A vertical list of ruled headline items, divided by hairlines. */
export function HeadlineList({
  posts,
  dek = false,
  kicker = true,
}: {
  posts: Post[];
  dek?: boolean;
  kicker?: boolean;
}) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {posts.map((post) => (
        <div key={post.id} className="py-5 first:pt-0 last:pb-0">
          <HeadlineItem post={post} dek={dek} kicker={kicker} />
        </div>
      ))}
    </div>
  );
}

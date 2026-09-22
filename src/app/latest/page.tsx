import type { Metadata } from "next";
import Link from "@/components/Link";
import { env } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import { publishDate, readingTimeLabel, sectionFor, sectionHref } from "@/lib/editorial";
import { bylineFor } from "@/lib/author";
import { formatDate } from "@/lib/format";

// Fully static chronological index of every published post, newest first.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Latest",
  description: `Every story from ${env.siteTitle}, newest first.`,
  alternates: { canonical: "/latest" },
};

export default async function LatestPage() {
  const posts = await getPosts(); // already newest-first

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <header className="mb-6 border-b-2 border-foreground pb-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
          Latest
        </h1>
        <p className="mt-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">
          {posts.length} {posts.length === 1 ? "Story" : "Stories"} · Newest first
        </p>
      </header>

      <ol className="divide-y divide-border">
        {posts.map((post) => {
          const byline = bylineFor(post);
          const section = sectionFor(post);
          return (
            <li
              key={post.id}
              className="group flex flex-col gap-1.5 py-5 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <time className="shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted sm:w-36">
                {formatDate(publishDate(post))}
              </time>
              <div className="min-w-0">
                <Link
                  href={sectionHref(section)}
                  className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-primary transition-opacity hover:opacity-70"
                >
                  {section}
                </Link>
                <Link href={`/posts/${post.slug}`} className="mt-1 block">
                  <h2 className="font-display text-lg font-semibold leading-snug text-heading transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>
                </Link>
                <p className="mt-1 text-sm text-muted">
                  <Link
                    href={`/authors/${byline.slug}`}
                    className="transition-colors hover:text-primary"
                  >
                    {byline.name}
                  </Link>{" "}
                  · {readingTimeLabel(post)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

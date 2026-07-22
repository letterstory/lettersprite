import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { env } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import {
  authorBySlug,
  authorProfile,
  authorsFromPosts,
  type Byline,
} from "@/lib/author";
import { orderedByDate, sectionFor } from "@/lib/editorial";
import { authorLd } from "@/lib/seo";
import type { Post } from "@/lib/letterbrace/types";
import { JsonLd } from "@/components/JsonLd";
import { StoryCard } from "@/components/Story";

type Params = { params: Promise<{ slug: string }> };

// Fully static: one page per byline present at build time; any other slug 404s.
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getPosts();
  return authorsFromPosts(posts).map((a) => ({ slug: a.slug }));
}

/** Resolve an author (byline, their posts newest-first, and their beats). */
async function resolveAuthor(slug: string): Promise<{
  byline: Byline;
  posts: Post[];
  beats: string[];
} | null> {
  const posts = await getPosts();
  const found = authorBySlug(posts, slug);
  if (!found) return null;
  const ordered = orderedByDate(found.posts);
  const beats = [...new Set(ordered.map((p) => sectionFor(p)))];
  return { byline: found.byline, posts: ordered, beats };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const author = await resolveAuthor(slug);
  if (!author) return {};
  const { bio } = authorProfile(author.byline, author.beats);
  return {
    title: author.byline.name,
    description: bio,
    alternates: { canonical: `/authors/${slug}` },
    openGraph: {
      type: "profile",
      title: `${author.byline.name} · ${env.siteTitle}`,
      description: bio,
      url: `${env.siteUrl}/authors/${slug}`,
    },
  };
}

export default async function AuthorPage({ params }: Params) {
  const { slug } = await params;
  const author = await resolveAuthor(slug);
  if (!author) notFound();

  const { byline, posts, beats } = author;
  const { bio, location } = authorProfile(byline, beats);
  const count = posts.length;

  return (
    <div className="container-wide px-6 py-12">
      <JsonLd data={authorLd(byline, posts, beats)} />

      <header className="mb-12 flex flex-col items-start gap-5 border-b-2 border-foreground pb-8 sm:flex-row sm:items-center sm:gap-6">
        <span
          className="avatar h-20 w-20 text-2xl"
          style={{ backgroundColor: byline.color }}
          aria-hidden
        >
          {byline.initials}
        </span>
        <div className="flex flex-col gap-2">
          <p className="kicker">{byline.role}</p>
          <h1 className="display text-4xl font-black leading-none sm:text-5xl">
            {byline.name}
          </h1>
          <p className="max-w-2xl text-fg-soft">{bio}</p>
          <p className="mt-1 text-xs text-muted">
            {count} {count === 1 ? "story" : "stories"}
            {!byline.provided && <> · {location}</>}
          </p>
        </div>
      </header>

      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <StoryCard key={post.id} post={post} size="md" ratio="16/9" dek />
        ))}
      </div>

      <div className="mt-16 flex justify-center">
        <Link href="/" className="kicker kicker-muted ul-link hover:text-primary">
          ← Back to {env.siteTitle}
        </Link>
      </div>
    </div>
  );
}

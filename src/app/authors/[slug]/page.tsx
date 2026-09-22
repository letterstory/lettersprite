import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { env } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import {
  authorBySlug,
  authorProfile,
  authorsFromPosts,
  type Byline,
} from "@/lib/author";
import { orderedByDate, sectionFor, sectionHref } from "@/lib/editorial";
import { getActiveTheme } from "@/themes";
import { authorLd } from "@/lib/seo";
import type { Post } from "@/lib/letterbrace/types";
import { JsonLd } from "@/components/JsonLd";
import { StoryCard } from "@/components/Story";
import { SlateIndex } from "@/components/SlateIndex";
import { FolioIndex } from "@/components/FolioIndex";
import { KioskIndex } from "@/components/KioskIndex";
import { VitrineIndex } from "@/components/VitrineIndex";
import { CommonsIndex } from "@/components/CommonsIndex";
import { BlitzIndex } from "@/components/BlitzIndex";
import { FluxIndex } from "@/components/FluxIndex";
import { WireIndex } from "@/components/WireIndex";

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

  const theme = getActiveTheme();

  // Bold tech-portal index (opt-in): colored banner + stream + right rail + ads.
  if (theme.features?.fluxLists) {
    return (
      <>
        <JsonLd data={authorLd(byline, posts, beats)} />
        <FluxIndex
          title={byline.name}
          stat={`${count} ${count === 1 ? "story" : "stories"}`}
          posts={posts}
        />
      </>
    );
  }

  // Culture-news index (opt-in): bold title + tabs + dense 4-col metric grid.
  if (theme.features?.blitzLists) {
    const stat = `${count} ${count === 1 ? "story" : "stories"}`;
    return (
      <>
        <JsonLd data={authorLd(byline, posts, beats)} />
        <BlitzIndex
          title={byline.name}
          siblings={beats.map((b) => ({ label: b, href: sectionHref(b) }))}
          stat={stat}
          posts={posts}
        />
      </>
    );
  }

  // syg.ma-style index (opt-in): minimal title + tabs + mixed masonry feed.
  if (theme.features?.commonsLists) {
    const stat = `${count} ${count === 1 ? "entry" : "entries"}`;
    return (
      <>
        <JsonLd data={authorLd(byline, posts, beats)} />
        <CommonsIndex
          title={byline.name}
          siblings={beats.map((b) => ({ label: b, href: sectionHref(b) }))}
          stat={stat}
          posts={posts}
        />
      </>
    );
  }

  // Franklin Azzi-style index (opt-in): uppercase title + tabs + captioned grid.
  if (theme.features?.vitrineLists) {
    const stat = `${count} ${count === 1 ? "story" : "stories"}`;
    return (
      <>
        <JsonLd data={authorLd(byline, posts, beats)} />
        <VitrineIndex
          title={byline.name}
          siblings={beats.map((b) => ({ label: b, href: sectionHref(b) }))}
          stat={stat}
          posts={posts}
        />
      </>
    );
  }

  // Taste-style index (opt-in): centered ruled title + 3-col card grid.
  if (theme.features?.kioskLists) {
    const stat = `${count} ${count === 1 ? "story" : "stories"} by ${byline.name}`;
    return (
      <>
        <JsonLd data={authorLd(byline, posts, beats)} />
        <KioskIndex
          title={byline.name}
          siblings={beats.map((b) => ({ label: b, href: sectionHref(b) }))}
          stat={stat}
          posts={posts}
        />
      </>
    );
  }

  // grafill-style index (opt-in): category switcher + big-card grid.
  if (theme.features?.folioLists) {
    const stat = `${count} ${count === 1 ? "story" : "stories"} by ${byline.name}`;
    return (
      <>
        <JsonLd data={authorLd(byline, posts, beats)} />
        <FolioIndex
          title={byline.name}
          siblings={beats.map((b) => ({ label: b, href: sectionHref(b) }))}
          stat={stat}
          posts={posts}
        />
      </>
    );
  }

  // ctrl.xyz-style index (opt-in): rounded card grid + pill chips + ad zones.
  if (theme.features?.wireLists) {
    const stat = `${count} ${count === 1 ? "story" : "stories"}${
      !byline.provided ? ` · ${location}` : ""
    }`;
    return (
      <>
        <JsonLd data={authorLd(byline, posts, beats)} />
        <WireIndex
          eyebrow={byline.role}
          title={byline.name}
          avatar={{ initials: byline.initials, color: byline.color }}
          stat={stat}
          chips={beats.map((b) => ({ label: b, href: sectionHref(b) }))}
          posts={posts}
          footer={
            <Link href="/" className="font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:text-primary">
              ← Back to {env.siteTitle}
            </Link>
          }
        />
      </>
    );
  }

  // Slate treatment (opt-in per theme): oversized name + byline-first lead +
  // story river. Other themes keep the classic avatar header + card grid.
  if (theme.features?.slateLists) {
    const stat = `${count} ${count === 1 ? "story" : "stories"}${
      !byline.provided ? ` · ${location}` : ""
    }`;
    return (
      <>
        <JsonLd data={authorLd(byline, posts, beats)} />
        <SlateIndex
          eyebrow={byline.role}
          title={byline.name}
          avatar={{ initials: byline.initials, color: byline.color }}
          bio={bio}
          stat={stat}
          accentLinks={beats.map((b) => ({ label: b, href: sectionHref(b) }))}
          metaKind="author"
          riverPrefix="More from"
          posts={posts}
          footer={
            <Link
              href="/"
              className="kicker kicker-muted ul-link hover:text-primary"
            >
              ← Back to {env.siteTitle}
            </Link>
          }
        />
      </>
    );
  }

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

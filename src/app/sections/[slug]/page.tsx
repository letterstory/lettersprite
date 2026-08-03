import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { env } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import {
  allSections,
  postsInSection,
  sectionNameFor,
  sectionSlug,
} from "@/lib/editorial";
import { StoryCard } from "@/components/Story";
import { Logo } from "@/components/Logo";

type Params = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getPosts();
  return allSections(posts).map((s) => ({ slug: sectionSlug(s) }));
}

/** Resolve the display name for a section slug from the posts that live in it. */
async function resolveSection(slug: string) {
  const posts = await getPosts();
  const name = sectionNameFor(posts, slug);
  if (!name) return null;
  return { name, posts: postsInSection(posts, slug) };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const section = await resolveSection(slug);
  if (!section) return {};
  const title = section.name;
  const description = `The latest in ${section.name} from ${env.siteTitle}.`;
  return {
    title,
    description,
    alternates: { canonical: `/sections/${slug}` },
    openGraph: {
      type: "website",
      title: `${title} · ${env.siteTitle}`,
      description,
      url: `${env.siteUrl}/sections/${slug}`,
    },
  };
}

export default async function SectionPage({ params }: Params) {
  const { slug } = await params;
  const section = await resolveSection(slug);
  if (!section) notFound();

  const [lead, ...rest] = section.posts;

  return (
    <div className="container-wide px-6 py-12">
      <header className="mb-10 border-b-2 border-foreground pb-6">
        <p className="kicker mb-3">Section</p>
        <h1 className="display text-5xl font-black leading-none sm:text-6xl">
          {section.name}
        </h1>
        <p className="mt-4 text-muted">
          {section.posts.length}{" "}
          {section.posts.length === 1 ? "story" : "stories"} in {section.name}.
        </p>
      </header>

      {lead && (
        <div className="mb-12 border-b border-border pb-12">
          <StoryCard post={lead} size="lg" ratio="16/9" dek headingLevel={2} />
        </div>
      )}

      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <StoryCard key={post.id} post={post} size="md" ratio="16/9" dek />
        ))}
      </div>

      <div className="mt-16 flex justify-center opacity-60">
        <Logo size="sm" linked />
      </div>
    </div>
  );
}

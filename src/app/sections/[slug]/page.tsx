import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { env } from "@/env";
import { getActiveTheme } from "@/themes";
import { getPosts } from "@/lib/letterbrace/client";
import {
  allSections,
  postsInSection,
  sectionHref,
  sectionNameFor,
  sectionSlug,
} from "@/lib/editorial";
import { StoryCard } from "@/components/Story";
import { SlateIndex } from "@/components/SlateIndex";
import { FolioIndex } from "@/components/FolioIndex";
import { KioskIndex } from "@/components/KioskIndex";
import { VitrineIndex } from "@/components/VitrineIndex";
import { CommonsIndex } from "@/components/CommonsIndex";
import { WireIndex } from "@/components/WireIndex";
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

  // Slate treatment (opt-in per theme): oversized title + byline-first lead +
  // story river. Other themes keep the classic card grid below.
  const theme = getActiveTheme();
  const count = section.posts.length;

  // syg.ma-style index (opt-in): minimal title + tabs + mixed masonry feed.
  if (theme.features?.commonsLists) {
    const posts = await getPosts();
    const siblings = allSections(posts)
      .filter((s) => s !== section.name)
      .map((s) => ({ label: s, href: sectionHref(s) }));
    return (
      <CommonsIndex
        title={section.name}
        siblings={siblings}
        stat={`${count} ${count === 1 ? "entry" : "entries"}`}
        posts={section.posts}
      />
    );
  }

  // Franklin Azzi-style index (opt-in): uppercase title + tabs + captioned grid.
  if (theme.features?.vitrineLists) {
    const posts = await getPosts();
    const siblings = allSections(posts)
      .filter((s) => s !== section.name)
      .map((s) => ({ label: s, href: sectionHref(s) }));
    return (
      <VitrineIndex
        title={section.name}
        siblings={siblings}
        stat={`${count} ${count === 1 ? "story" : "stories"}`}
        posts={section.posts}
      />
    );
  }

  // Taste-style index (opt-in): centered ruled title + 3-col card grid.
  if (theme.features?.kioskLists) {
    const posts = await getPosts();
    const siblings = allSections(posts)
      .filter((s) => s !== section.name)
      .map((s) => ({ label: s, href: sectionHref(s) }));
    return (
      <KioskIndex
        title={section.name}
        siblings={siblings}
        stat={`${count} ${count === 1 ? "story" : "stories"} in ${section.name}`}
        posts={section.posts}
      />
    );
  }

  // grafill-style index (opt-in): category switcher + big-card grid.
  if (theme.features?.folioLists) {
    const posts = await getPosts();
    const siblings = allSections(posts)
      .filter((s) => s !== section.name)
      .map((s) => ({ label: s, href: sectionHref(s) }));
    return (
      <FolioIndex
        title={section.name}
        siblings={siblings}
        stat={`${count} ${count === 1 ? "story" : "stories"} in ${section.name}`}
        posts={section.posts}
      />
    );
  }

  // ctrl.xyz-style index (opt-in): rounded card grid + pill chips + ad zones.
  if (theme.features?.wireLists) {
    const posts = await getPosts();
    const siblings = allSections(posts)
      .filter((s) => s !== section.name)
      .map((s) => ({ label: s, href: sectionHref(s) }));
    return (
      <WireIndex
        eyebrow="Section"
        title={section.name}
        stat={`${count} ${count === 1 ? "story" : "stories"} in ${section.name}`}
        chips={siblings}
        posts={section.posts}
        footer={<Logo size="sm" linked />}
      />
    );
  }

  if (theme.features?.slateLists) {
    const posts = await getPosts();
    const siblings = allSections(posts)
      .filter((s) => s !== section.name)
      .map((s) => ({ label: s, href: sectionHref(s) }));
    return (
      <SlateIndex
        eyebrow="The latest in"
        title={section.name}
        accentLinks={siblings}
        stat={`${count} ${count === 1 ? "story" : "stories"}`}
        metaKind="section"
        riverPrefix="Recently in"
        posts={section.posts}
        footer={<Logo size="sm" linked />}
      />
    );
  }

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

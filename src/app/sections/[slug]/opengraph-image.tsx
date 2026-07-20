/**
 * Generated Open Graph card for a section index, e.g. `/sections/technology`.
 * Renders the section name over the theme's hero gradient with the masthead as
 * an eyebrow. Prerendered for every known section (the colocated page fixes the
 * param set via `generateStaticParams` + `dynamicParams = false`).
 */
import { env } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import { allSections, sectionNameFor, sectionSlug } from "@/lib/editorial";
import { OG_CONTENT_TYPE, OG_SIZE, ogCardResponse } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `${env.siteTitle} — Section`;

// Prerender one card per section at build time (matching the colocated page), so
// the image is static rather than server-rendered on demand.
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getPosts();
  return allSections(posts).map((s) => ({ slug: sectionSlug(s) }));
}

type Params = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Params) {
  const { slug } = await params;
  const posts = await getPosts();
  const section = sectionNameFor(posts, slug);

  return ogCardResponse({
    title: section ?? env.siteTitle,
    eyebrow: env.siteTitle,
    subtitle: section ? `The latest in ${section}.` : undefined,
  });
}

import type { Metadata } from "next";
import Link from "next/link";
import { env } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import { topSections, sectionHref } from "@/lib/editorial";
import { authorsFromPosts } from "@/lib/author";
import { aboutLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Logo } from "@/components/Logo";

export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  const title = `About ${env.siteTitle}`;
  const description =
    env.siteDescription ||
    `About ${env.siteTitle} — what we cover and who writes it.`;
  return {
    title: "About",
    description,
    alternates: { canonical: "/about" },
    openGraph: {
      title,
      description,
      url: `${env.siteUrl}/about`,
      siteName: env.siteTitle,
      type: "website",
    },
  };
}

/**
 * A masthead / About page: the publication's own words, the topics it covers
 * (linking every section hub) and its contributors (linking every author page).
 * Backs the site-wide Organization schema with a real HTML page, and gives Google
 * a canonical hub that reinforces the section + author structure. Deliberately
 * modest — it states what the site covers, not fabricated credentials.
 */
export default async function AboutPage() {
  const posts = await getPosts();
  const sections = topSections(posts, 24);
  const authors = authorsFromPosts(posts).slice(0, 24);

  return (
    <div className="container-wide px-6 py-12">
      <JsonLd data={aboutLd()} />

      <header className="mb-10 border-b-2 border-foreground pb-6">
        <p className="kicker mb-3">About</p>
        <h1 className="display text-5xl font-black leading-none sm:text-6xl">
          {env.siteTitle}
        </h1>
        {env.siteDescription && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            {env.siteDescription}
          </p>
        )}
      </header>

      {sections.length > 0 && (
        <section className="mb-12">
          <h2 className="kicker mb-4">What we cover</h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-2.5 text-lg">
            {sections.map((s) => (
              <li key={s}>
                <Link
                  href={sectionHref(s)}
                  className="font-heading font-semibold ul-link hover:text-primary"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {authors.length > 0 && (
        <section className="mb-12">
          <h2 className="kicker mb-4">Contributors</h2>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {authors.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/authors/${a.slug}`}
                  className="font-heading font-semibold ul-link hover:text-primary"
                >
                  {a.byline.name}
                </Link>
                {a.byline.role && (
                  <span className="text-muted"> · {a.byline.role}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-16 flex justify-center opacity-60">
        <Logo size="sm" linked />
      </div>
    </div>
  );
}

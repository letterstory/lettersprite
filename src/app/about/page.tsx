import type { Metadata } from "next";
import Link from "@/components/Link";
import { env } from "@/env";
import { getPosts } from "@/lib/letterbrace/client";
import { topSections, sectionHref } from "@/lib/editorial";
import { authorsFromPosts } from "@/lib/author";
import { siteByline, siteDisclosure } from "@/lib/disclosure";
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
 *
 * When the site discloses (`siteDisclosure` lists `site_statement`), it says
 * who funds it — Letter's words, verbatim — and, under `site_byline`,
 * lists no contributors: the writing is credited to the publication, not to
 * people.
 */
export default async function AboutPage() {
  const posts = await getPosts();
  const sections = topSections(posts, 24);
  const disclosure = siteDisclosure(posts);
  const authors = siteByline(disclosure) ? [] : authorsFromPosts(posts).slice(0, 24);

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

      {disclosure && (
        <section className="mb-12" aria-labelledby="ownership">
          <h2 id="ownership" className="kicker mb-4">
            Ownership and funding
          </h2>
          <p className="publication-disclosure max-w-2xl">{disclosure.siteText}</p>
          <p className="mt-2 text-lg">
            {disclosure.sponsor.url ? (
              <a
                href={disclosure.sponsor.url}
                rel="sponsored noopener"
                className="font-heading font-semibold ul-link hover:text-primary"
              >
                {disclosure.sponsor.name}
              </a>
            ) : (
              <span className="font-heading font-semibold">{disclosure.sponsor.name}</span>
            )}
          </p>
        </section>
      )}

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

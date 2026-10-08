import { env } from "@/env";
import { getBrand } from "@/lib/brand";
import { topSections } from "@/lib/editorial";
import type { StudioLayout } from "@/lib/layouts";
import { loadArticle, loadHome } from "@/lib/studio";
import { EmptyState } from "@/components/EmptyState";
import { JsonLd } from "@/components/JsonLd";
import { articleLd, blogListingLd, breadcrumbLd } from "@/lib/seo";
import { StudioShell } from "./StudioShell";
import { NotesHome } from "./layouts/NotesHome";
import { NotesArticle } from "./layouts/NotesArticle";
import { JournalHome } from "./layouts/JournalHome";
import { JournalArticle } from "./layouts/JournalArticle";
import { MagazineHome } from "./layouts/MagazineHome";
import { MagazineArticle } from "./layouts/MagazineArticle";
import { EssayHome } from "./layouts/EssayHome";
import { EssayArticle } from "./layouts/EssayArticle";
import { BroadsheetHome } from "./layouts/BroadsheetHome";
import { BroadsheetArticle } from "./layouts/BroadsheetArticle";
import { ClinicalHome } from "./layouts/ClinicalHome";
import { ClinicalArticle } from "./layouts/ClinicalArticle";

const HOMES = {
  notes: NotesHome,
  journal: JournalHome,
  magazine: MagazineHome,
  essay: EssayHome,
  broadsheet: BroadsheetHome,
  clinical: ClinicalHome,
};
const ARTICLES = {
  notes: NotesArticle,
  journal: JournalArticle,
  magazine: MagazineArticle,
  essay: EssayArticle,
  broadsheet: BroadsheetArticle,
  clinical: ClinicalArticle,
};

/** The /new home in a given layout. */
export async function StudioHomePage({
  layout,
  section,
}: {
  layout: StudioLayout;
  /** Render one section's page: the home, scoped to that section's posts. */
  section?: { slug: string; name: string };
}) {
  const brand = getBrand();
  const data = await loadHome(section?.slug);
  if (data.posts.length === 0) {
    return (
      <StudioShell layout={layout}>
        <div className="s-wrap" style={{ padding: "6rem 0" }}>
          <EmptyState />
        </div>
      </StudioShell>
    );
  }
  // The headline is the site's line; with none, its description steps up.
  const siteLine = env.siteTagline || brand.slogan || env.siteDescription || brand.name;
  const headline = section?.name ?? siteLine;
  const dek = section || headline === env.siteDescription ? "" : env.siteDescription;
  // A brand's blog is "The X Blog"; an independent publication names its beats.
  const eyebrow = section
    ? brand.name
    : brand.ask === "product"
      ? `${/^the\s/i.test(brand.name) ? brand.name : `The ${brand.name}`} Blog`
      : topSections(data.posts, 3).join(" · ");
  const Home = HOMES[layout];
  return (
    <StudioShell layout={layout}>
      <Home brand={brand} data={data} eyebrow={eyebrow} headline={headline} dek={dek} />
      {/* The same structured data the current design emits. */}
      <JsonLd data={blogListingLd(data.posts)} />
    </StudioShell>
  );
}

/** A /new post in a given layout; null when the slug isn't served. */
export async function StudioPostPage({ slug, layout }: { slug: string; layout: StudioLayout }) {
  const a = await loadArticle(slug);
  if (!a) return null;
  const Article = ARTICLES[layout];
  return (
    <StudioShell layout={layout}>
      <Article brand={getBrand()} a={a} />
      <JsonLd data={articleLd(a.post)} />
      <JsonLd data={breadcrumbLd(a.post)} />
    </StudioShell>
  );
}

import type { Metadata } from "next";
import { env } from "@/env";
import { getBrand } from "@/lib/brand";
import { topSections } from "@/lib/editorial";
import { getLayout, loadHome } from "@/lib/studio";
import { EmptyState } from "@/components/EmptyState";
import { StudioShell } from "@/components/studio/StudioShell";
import { NotesHome } from "@/components/studio/layouts/NotesHome";
import { JournalHome } from "@/components/studio/layouts/JournalHome";
import { MagazineHome } from "@/components/studio/layouts/MagazineHome";
import { EssayHome } from "@/components/studio/layouts/EssayHome";

export const dynamic = "force-static";

// The redesign is a preview of the same pages: canonical stays on the live URL.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

const HOMES = { notes: NotesHome, journal: JournalHome, magazine: MagazineHome, essay: EssayHome };

export default async function StudioHome() {
  const brand = getBrand();
  const data = await loadHome();
  if (data.posts.length === 0) {
    return (
      <StudioShell>
        <div className="s-wrap" style={{ padding: "6rem 0" }}>
          <EmptyState />
        </div>
      </StudioShell>
    );
  }
  // The headline is the site's line; with none, its description steps up.
  const headline = env.siteTagline || brand.slogan || env.siteDescription || brand.name;
  const dek = headline === env.siteDescription ? "" : env.siteDescription;
  // A brand's blog is "The X Blog"; an independent publication names its beats.
  const eyebrow =
    brand.ask === "product"
      ? `${/^the\s/i.test(brand.name) ? brand.name : `The ${brand.name}`} Blog`
      : topSections(data.posts, 3).join(" · ");
  const Home = HOMES[getLayout()];
  return (
    <StudioShell>
      <Home brand={brand} data={data} eyebrow={eyebrow} headline={headline} dek={dek} />
    </StudioShell>
  );
}

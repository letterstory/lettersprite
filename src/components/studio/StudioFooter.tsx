import type { Brand } from "@/lib/brand";

const SOCIAL_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X",
  twitter: "X",
  youtube: "YouTube",
  github: "GitHub",
  tiktok: "TikTok",
};

/** A closing band in the brand's own voice, then the site's real footer links. */
export function StudioFooter({ brand }: { brand: Brand }) {
  const year = new Date().getFullYear();
  return (
    <footer className="s-footer">
      <section className="s-closer">
        <div className="s-wrap s-closer-row">
          <h2 className="s-closer-title">{brand.cta.headline}</h2>
          <a href={brand.cta.url} className="s-button s-button-light">
            {brand.cta.label} <span aria-hidden>→</span>
          </a>
        </div>
      </section>
      <div className="s-wrap s-footer-row">
        <a href={brand.homeUrl} className="s-footer-brand">
          {brand.logoOnDark ? (
            <img src={brand.logoOnDark} alt={brand.name} className="s-footer-logo" />
          ) : (
            <span className="s-brand-name">{brand.name}</span>
          )}
        </a>
        <nav className="s-footer-links" aria-label="Footer">
          {brand.footerLinks.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          {brand.socials.map((s) => (
            <a key={s.url} href={s.url} rel="me noopener" target="_blank">
              {SOCIAL_LABELS[s.type] ?? s.type.charAt(0).toUpperCase() + s.type.slice(1)}
            </a>
          ))}
          <a href="/feed.xml">RSS</a>
        </nav>
        <p className="s-footer-fine">
          © {year} {brand.name}
        </p>
      </div>
    </footer>
  );
}

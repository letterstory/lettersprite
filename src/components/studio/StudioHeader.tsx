import Link from "@/components/Link";
import type { Brand } from "@/lib/brand";

/**
 * The customer's own masthead: their mark and name, their site's links, their
 * primary button. The blog reads as a section of their site, not a separate
 * publication.
 */
export function StudioHeader({ brand }: { brand: Brand }) {
  return (
    <header className="s-header">
      <div className="s-wrap s-header-row">
        <a href={brand.homeUrl} className="s-brand" aria-label={`${brand.name} home`}>
          {brand.logoOnLight ? (
            <img src={brand.logoOnLight} alt={brand.name} className="s-brand-logo" />
          ) : (
            <>
              {brand.icon && (
                <img src={brand.icon} alt="" className="s-brand-icon" />
              )}
              <span className="s-brand-name">{brand.name}</span>
            </>
          )}
        </a>
        <Link href="/new" className="s-header-section">
          Blog
        </Link>
        <nav className="s-header-nav" aria-label={`${brand.name} site`}>
          {brand.nav.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          <a href={brand.cta.url} className="s-button">
            {brand.cta.label}
          </a>
        </nav>
      </div>
    </header>
  );
}

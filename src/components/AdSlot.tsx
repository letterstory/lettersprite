import { env } from "@/env";
import { AdsPush } from "./AdsPush";

/**
 * A single ad zone. Three behaviours, so no fake creative or empty boxes ever
 * ship:
 *  - Configured (deployment set `SITE_ADSENSE_CLIENT` + a slot): a real Google
 *    AdSense responsive unit.
 *  - Unconfigured in dev: a labeled dashed placeholder, so the zone is visible
 *    while designing.
 *  - Unconfigured in production: renders nothing.
 *
 * Reusable across layouts; a theme opts into ads simply by placing `<AdSlot />`
 * where it wants them.
 */
export function AdSlot({
  slot,
  className = "",
  minHeightClass = "min-h-[120px]",
  format = "auto",
  house,
}: {
  /** Ad unit id; falls back to `SITE_ADSENSE_SLOT`. */
  slot?: string;
  className?: string;
  /** Reserve height to limit layout shift while the unit loads. */
  minHeightClass?: string;
  format?: string;
  /**
   * When no real ad is configured, fill the zone with a self-promo "house ad"
   * (in dev AND production) instead of a dev-only placeholder / empty box.
   * `tower` is a vertical sidebar creative; `banner` a horizontal leaderboard.
   */
  house?: "tower" | "banner";
}) {
  const client = env.adsenseClient;
  const unit = slot || env.adsenseSlot;
  const isDev = process.env.NODE_ENV !== "production";

  const label = (
    <p className="mb-1 text-center font-heading text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted">
      Advertisement
    </p>
  );

  // Configured: a real AdSense unit.
  if (client && unit) {
    return (
      <div className={`no-print ${className}`}>
        {label}
        <ins
          className={`adsbygoogle block ${minHeightClass}`}
          style={{ display: "block" }}
          data-ad-client={client}
          data-ad-slot={unit}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
        <AdsPush />
      </div>
    );
  }

  // Unconfigured but the zone asked for a house ad: a self-promo creative, so
  // the slot reads as a filled ad rather than an empty box (dev and prod).
  if (house) {
    const tower = house === "tower";
    return (
      <div className={`no-print ${className}`}>
        {label}
        <div
          className={`flex ${minHeightClass} overflow-hidden rounded border border-border bg-gradient-to-b from-tint to-surface ${
            tower
              ? "flex-col items-center justify-center gap-4 px-6 py-10 text-center"
              : "flex-col items-center justify-center gap-3 px-6 py-6 text-center sm:flex-row sm:justify-between sm:gap-6 sm:text-left"
          }`}
        >
          <div className={tower ? "" : "sm:flex-1"}>
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-primary">
              Newsletter
            </span>
            <p className="mt-2 font-display text-xl font-bold leading-tight text-heading">
              {env.siteTitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              The playbooks and case studies behind great startup video — in your
              inbox, weekly.
            </p>
          </div>
          <span className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-[color:var(--primary-fg)]">
            Subscribe →
          </span>
        </div>
      </div>
    );
  }

  // Unconfigured in dev: a visible placeholder so the layout still reads.
  if (isDev) {
    return (
      <div className={`no-print ${className}`}>
        {label}
        <div
          className={`flex ${minHeightClass} items-center justify-center rounded border border-dashed border-border bg-surface text-xs text-muted`}
        >
          Ad slot{unit ? ` · ${unit}` : ""}
        </div>
      </div>
    );
  }

  // Unconfigured in production: render nothing.
  return null;
}

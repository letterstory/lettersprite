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
}: {
  /** Ad unit id; falls back to `SITE_ADSENSE_SLOT`. */
  slot?: string;
  className?: string;
  /** Reserve height to limit layout shift while the unit loads. */
  minHeightClass?: string;
  format?: string;
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

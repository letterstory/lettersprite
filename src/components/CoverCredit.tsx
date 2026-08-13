import type { CoverCredit as Credit } from "@/lib/letterbrace/types";

/** Source name as a reader sees it. Unknown sources are title-cased as-is. */
function sourceLabel(source: string): string {
  const known: Record<string, string> = {
    unsplash: "Unsplash",
    pexels: "Pexels",
    openverse: "Openverse",
  };
  const key = source.toLowerCase();
  return known[key] ?? source.charAt(0).toUpperCase() + source.slice(1);
}

/**
 * A short licence label, or null when naming the licence adds nothing.
 *
 * Pexels and Unsplash have one bespoke licence each, already implied by the
 * source name — "Photo by X on Unsplash (Unsplash)" is noise. Openverse
 * aggregates many, so its code carries real information and must be shown.
 * Its API returns bare Creative Commons codes ("by", "by-sa", "cc0", "pdm").
 */
function licenseLabel(license: string): string | null {
  const code = license.toLowerCase().trim();
  if (!code || code === "unknown" || code === "pexels" || code === "unsplash") {
    return null;
  }
  if (code === "cc0") return "CC0";
  if (code === "pdm") return "Public Domain";
  // "by-sa" and "cc-by-sa" are the same licence written two ways.
  const cc = code.replace(/^cc-/, "");
  if (/^by(-[a-z]{2})*$/.test(cc)) return `CC ${cc.toUpperCase()}`;
  return license.toUpperCase();
}

/**
 * Photographer and licence for a stock-photo cover, rendered under the hero.
 *
 * This is a licence obligation, not a design flourish: Unsplash's API terms and
 * every CC-BY photo require the photographer to be named wherever the image is
 * displayed. Letterbrace decides which of those apply and ships the answer as
 * `required` — a Pexels or CC0 cover sets it false and renders nothing, keeping
 * the page clean where nothing is owed.
 *
 * Degrades in the order the data degrades: a photographer with a profile link
 * becomes a link, a photographer without one stays plain text, and a photo with
 * no photographer at all credits the source alone.
 *
 * Frozen at build time like all content here — a re-credited photo needs a
 * rebuild before the site shows it.
 */
export function CoverCredit({
  credit,
  className = "",
}: {
  credit: Credit | null;
  className?: string;
}) {
  if (!credit?.required) return null;

  const source = sourceLabel(credit.source);
  const license = licenseLabel(credit.license);
  const { photographer, photographerUrl, sourceUrl } = credit;

  const sourceNode = sourceUrl ? (
    <a
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="ul-link"
    >
      {source}
    </a>
  ) : (
    source
  );

  return (
    <span className={className}>
      {photographer ? (
        <>
          Photo by{" "}
          {photographerUrl ? (
            <a
              href={photographerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ul-link"
            >
              {photographer}
            </a>
          ) : (
            photographer
          )}{" "}
          on {sourceNode}
        </>
      ) : (
        <>Photo via {sourceNode}</>
      )}
      {license ? ` (${license})` : null}
    </span>
  );
}

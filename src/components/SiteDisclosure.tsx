import type { SponsorDisclosure } from "@/lib/letterbrace/types";
import { siteStatement } from "@/lib/disclosure";

/**
 * The site-wide statement in the footer of every page, when the site's
 * disclosure (`siteDisclosure`) lists `site_statement`: `siteText` —
 * Letter's words, verbatim. Readers and crawlers get
 * the same line. `.publication-disclosure` is pinned against Readability's
 * strip patterns (disclosure-readability.test.tsx); "footer" is one of them.
 */
export function SiteDisclosure({
  disclosure,
  className = "",
}: {
  disclosure: SponsorDisclosure | null;
  className?: string;
}) {
  const statement = siteStatement(disclosure);
  if (!statement) return null;
  return (
    <p
      className={className ? `publication-disclosure ${className}` : "publication-disclosure"}
      role="note"
    >
      {statement}
    </p>
  );
}

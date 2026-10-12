import type { SponsorDisclosure } from "@/lib/letterbrace/types";
import { headerLine } from "@/lib/disclosure";

/**
 * The disclosure at the top of the article, by the byline, when the post's
 * disclosure lists `article_header`: Letterstory's `label`, verbatim
 * ("Sponsored by Acme"). The FTC's placement — with the content, hard to miss — where the
 * footer line is the weakest one.
 *
 * Set beside the byline row, never inside it: Readability lifts an element
 * classed `byline`/`author` out of the article as metadata, and strips one
 * classed like an ad (`sponsor`, `meta`, `header`, …), so `.disclosure-lead`
 * is pinned against both in disclosure-readability.test.tsx. Styled at body
 * size in full ink (globals.css, studio.css) — never muted, never small.
 */
export function DisclosureLabel({
  disclosure,
  className = "",
}: {
  disclosure: SponsorDisclosure | null;
  className?: string;
}) {
  const line = headerLine(disclosure);
  if (!line) return null;
  return (
    <p className={className ? `disclosure-lead ${className}` : "disclosure-lead"} role="note">
      {line}
    </p>
  );
}

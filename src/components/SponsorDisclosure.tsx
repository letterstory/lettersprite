import type { SponsorDisclosure as Disclosure } from "@/lib/letterbrace/types";
import { discloses } from "@/lib/disclosure";

/**
 * The sponsor disclosure line, set after the article body when the post's
 * disclosure lists `article_footer`.
 *
 * The sentence is Letterstory's, rendered verbatim — the site never words a
 * disclosure itself, so no theme can soften it. It is presentation, never part
 * of the body: the body is what the mention machinery measures, and a
 * disclosure is a statement about the publication, not a mention in the
 * article. Styled `.sponsor-disclosure` from the theme's tokens (globals.css,
 * studio.css) at body size, because the FTC standard is "clear and
 * conspicuous" — not a footnote in muted grey.
 */
export function SponsorDisclosure({ disclosure }: { disclosure: Disclosure | null }) {
  if (!discloses(disclosure, "article_footer")) return null;
  return (
    <p className="sponsor-disclosure" role="note">
      {disclosure.text}
    </p>
  );
}

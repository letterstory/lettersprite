import type { SponsorDisclosure } from "@/lib/letterbrace/types";
import { discloses } from "@/lib/disclosure";

/**
 * "Sponsored by …" over the cover, when the post's disclosure lists
 * `cover_badge`. The words are Letterstory's `badge_text`, verbatim.
 *
 * Set by the template, never burned into the cover pixels: the image stays
 * clean for every crop and the badge goes the moment the setting does.
 *
 * Place it inside the element that frames the cover, marked `.disclosure-frame`
 * (which only makes it the positioning box). The badge is inset from the
 * frame's corner by `--sponsor-safe` (globals.css), the crop-safe margin the
 * cover generator plans for. A layout with no cover sets it `inline`, in the
 * article header, so the disclosure never depends on there being a picture.
 */
export function SponsorBadge({
  disclosure,
  inline = false,
}: {
  disclosure: SponsorDisclosure | null;
  inline?: boolean;
}) {
  if (!discloses(disclosure, "cover_badge")) return null;
  return (
    <span className={inline ? "cover-disclosure cover-disclosure-inline" : "cover-disclosure"}>
      {disclosure.badgeText}
    </span>
  );
}

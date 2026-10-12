/**
 * Formerly: decorative display ads for invented brands, so ad zones "read like real
 * display ads". Retired 2026-10-12 with the other manufactured credibility (invented
 * dates, audience claims, mock social posts): a publication that says who sponsors it
 * does not dress itself as an ad-funded outlet (letterstory
 * docs/architecture/phantom-aup-audit-2026-10-12.md, item 4). Renders nothing, so every
 * layout's ad slot collapses; the props stay so call sites keep compiling.
 */
type Variant = "leaderboard" | "box";

export function FakeAd(props: {
  variant?: Variant;
  seed?: number;
  className?: string;
  label?: boolean;
}) {
  void props;
  return null;
}

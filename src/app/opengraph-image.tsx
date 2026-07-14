/**
 * Generated Open Graph card for the homepage (and the site-wide default for any
 * route that doesn't set its own image). Renders the masthead over the theme's
 * hero gradient so a shared root link unfurls as the publication, not a blank
 * card. See `src/lib/og.tsx`.
 */
import { env } from "@/env";
import { OG_CONTENT_TYPE, OG_SIZE, ogCardResponse } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = env.siteTagline
  ? `${env.siteTitle} — ${env.siteTagline}`
  : env.siteTitle;

export default function Image() {
  return ogCardResponse({
    title: env.siteTitle,
    eyebrow: env.siteTagline || undefined,
    subtitle: env.siteDescription || undefined,
  });
}

import NextLink from "next/link";
import type { ComponentProps } from "react";

/**
 * Site-wide link wrapper.
 *
 * These are static/ISR reader pages, and the homepage and section nav list
 * *every* post and section. With Next's default viewport prefetch, each visible
 * link fires its own RSC prefetch the moment it scrolls into view — on a single
 * homepage render we measured 50+ prefetch requests saturating the browser's
 * connection pool and starving the actual content and cover images of bandwidth
 * (a ~26s network tail).
 *
 * Defaulting `prefetch={false}` drops that speculative viewport flood; Next
 * still warms a route on hover/touch, so navigating stays fast. Any link that
 * genuinely wants eager prefetch can pass `prefetch` explicitly to override.
 */
export function Link({
  prefetch = false,
  ...props
}: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={prefetch} {...props} />;
}

export default Link;

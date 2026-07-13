import type { MetadataRoute } from "next";
import { env, hasLetterbraceKey } from "@/env";

export default function robots(): MetadataRoute.Robots {
  // Preview / sample builds (no Letterbrace key) are also noindex at the page
  // level; keep robots.txt consistent so they never get crawled.
  if (!hasLetterbraceKey) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${env.siteUrl}/sitemap.xml`,
    host: env.siteUrl,
  };
}

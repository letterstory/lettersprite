import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { env, hasLetterbraceKey } from "@/env";
import { siteFavicon } from "@/lib/favicon";
import { siteGraphLd } from "@/lib/seo";
import { getActiveTheme } from "@/themes";
import { googleFontsHref, themeToCssVars } from "@/themes/css";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function generateMetadata(): Metadata {
  const title = env.siteTitle;
  const description = env.siteDescription || undefined;
  const favicon = siteFavicon(title);
  // Sample/preview builds (no Letterbrace key) should not be indexed so they
  // don't dilute the real production domain.
  const indexable = hasLetterbraceKey;
  return {
    metadataBase: new URL(env.siteUrl),
    title: { default: title, template: `%s · ${title}` },
    description,
    applicationName: title,
    icons: favicon ? { icon: [favicon] } : undefined,
    alternates: {
      canonical: "/",
      types: { "application/rss+xml": `${env.siteUrl}/feed.xml` },
    },
    robots: indexable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: title,
      title,
      description,
      url: env.siteUrl,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: env.twitterHandle ? `@${env.twitterHandle}` : undefined,
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const theme = getActiveTheme();
  const fontsHref = googleFontsHref(theme);

  return (
    <html
      lang="en"
      data-theme={theme.name}
      style={themeToCssVars(theme)}
      className="h-full"
    >
      <head>
        {fontsHref && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin="anonymous"
            />
            <link rel="stylesheet" href={fontsHref} />
          </>
        )}
        <JsonLd data={siteGraphLd()} />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} aria-label="Main content" className="w-full flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

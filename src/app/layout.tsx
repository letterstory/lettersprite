import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { env } from "@/env";
import { getActiveTheme } from "@/themes";
import { googleFontsHref, themeToCssVars } from "@/themes/css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function generateMetadata(): Metadata {
  const title = env.siteTitle;
  const description = env.siteDescription || undefined;
  return {
    metadataBase: new URL(env.siteUrl),
    title: { default: title, template: `%s · ${title}` },
    description,
    openGraph: {
      type: "website",
      siteName: title,
      title,
      description,
      url: env.siteUrl,
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: "/" },
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
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <SiteHeader />
        <main className="w-full flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

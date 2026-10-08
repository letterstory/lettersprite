import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { env } from "@/env";
import { LAYOUTS, isLayout } from "@/lib/layouts";
import { StudioHomePage } from "@/components/studio/pages";

type Params = { params: Promise<{ layout: string }> };

export const dynamic = "force-static";
export const dynamicParams = false;

// Every layout of the home, prebuilt — only on demo builds, where the design
// switch lets a reader try them (the proxy serves these under /new).
export function generateStaticParams() {
  return env.designCompare ? LAYOUTS.map((layout) => ({ layout })) : [];
}

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  robots: { index: false, follow: false },
};

export default async function StyledHome({ params }: Params) {
  const { layout } = await params;
  if (!isLayout(layout)) notFound();
  return <StudioHomePage layout={layout} />;
}

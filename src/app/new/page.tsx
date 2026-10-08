import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { env } from "@/env";
import { getLayout } from "@/lib/studio";
import { StudioHomePage } from "@/components/studio/pages";

export const dynamic = "force-static";

// The redesign is a preview of the same pages: canonical stays on the live URL.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

export default function StudioHome() {
  // /new is the side-by-side preview: demo builds only.
  if (!env.designCompare) notFound();
  return <StudioHomePage layout={getLayout()} />;
}

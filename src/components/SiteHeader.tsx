import Link from "next/link";
import { env } from "@/env";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-md">
      <div className="container-wide flex items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-heading text-lg font-bold tracking-tight">
          {env.siteTitle}
        </Link>
        <nav className="text-sm font-medium">
          <Link
            href="/"
            className="text-muted transition-colors hover:text-foreground"
          >
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}

import { env } from "@/env";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="container-wide flex flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-muted sm:flex-row">
        <p>
          © {year} {env.siteTitle}
        </p>
      </div>
    </footer>
  );
}

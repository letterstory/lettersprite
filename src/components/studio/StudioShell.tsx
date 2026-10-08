import type { ReactNode } from "react";
import { brandCssVars, getBrand } from "@/lib/brand";
import { StudioFooter } from "./StudioFooter";
import { StudioHeader } from "./StudioHeader";
import "./studio.css";

/** The redesign's frame: brand tokens, brand fonts, header and footer. */
export function StudioShell({ children }: { children: ReactNode }) {
  const brand = getBrand();
  return (
    <div className="studio" style={brandCssVars(brand) as React.CSSProperties}>
      {brand.fonts.googleHref && (
        // React 19 hoists stylesheet links with a precedence into <head>.
        <link rel="stylesheet" href={brand.fonts.googleHref} precedence="default" />
      )}
      {/* Paint the page edge (overscroll, short pages) in the brand paper too. */}
      <style>{`html,body{background:${brand.colors.paper}}`}</style>
      <StudioHeader brand={brand} />
      {children}
      <StudioFooter brand={brand} />
    </div>
  );
}

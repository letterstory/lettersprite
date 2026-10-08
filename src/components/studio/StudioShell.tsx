import type { ReactNode } from "react";
import { brandCssVars, getBrand } from "@/lib/brand";
import { StudioFooter } from "./StudioFooter";
import { StudioHeader } from "./StudioHeader";
import { TopicScope } from "./TopicFilter";
import "./studio.css";

/** The redesign's frame: brand tokens, brand fonts, header and footer. */
export function StudioShell({ children, layout }: { children: ReactNode; layout?: string }) {
  const brand = getBrand();
  return (
    <div className={`studio ${layout ? `l-${layout}` : ""}`} style={brandCssVars(brand) as React.CSSProperties}>
      {brand.fonts.googleHref && (
        // React 19 hoists stylesheet links with a precedence into <head>.
        <link rel="stylesheet" href={brand.fonts.googleHref} precedence="default" />
      )}
      {/* Paint the page edge (overscroll, short pages) in the brand paper too. */}
      <style>{`html,body{background:${brand.colors.paper}}`}</style>
      <StudioHeader brand={brand} />
      <TopicScope />
      {children}
      <StudioFooter brand={brand} />
    </div>
  );
}

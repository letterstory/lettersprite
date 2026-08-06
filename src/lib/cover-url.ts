const SUPABASE_OBJECT_PATH = "/storage/v1/object/public/";
const SUPABASE_RENDER_PATH = "/storage/v1/render/image/public/";

/**
 * Resize a cover through Supabase Storage's image-transform endpoint.
 *
 * Supabase serves the raw object bytes at `/object/public/…` — for an AI cover
 * that's a multi-MB full-resolution PNG (~2 MB) downloaded even into a ~400px
 * card. The `/render/image/public/…` endpoint resizes on the fly and honours
 * WebP content-negotiation (the browser's `Accept` header), which takes that
 * same cover from ~2 MB down to ~15 KB. We only rewrite URLs that live on our
 * own Storage; external covers (stock photos, the local `/covers/*` fallbacks)
 * are returned untouched. `width` alone scales proportionally.
 */
export function sizedCover(url: string, width: number): string {
  if (!url.includes(SUPABASE_OBJECT_PATH)) return url;
  const rendered = url.replace(SUPABASE_OBJECT_PATH, SUPABASE_RENDER_PATH);
  const sep = rendered.includes("?") ? "&" : "?";
  return `${rendered}${sep}width=${width}&quality=70`;
}

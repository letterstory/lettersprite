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
 * are returned untouched.
 *
 * `resize=contain` IS LOAD-BEARING. `width` on its own does NOT scale
 * proportionally — Supabase resizes to (width × the SOURCE height), which for a
 * landscape cover is a hard horizontal crop that gets more extreme the smaller
 * the request. Measured against a real 2528×1696 cover:
 *
 *     width=1600            → 1600×1696  (0.94, near-square)
 *     width=800             → 800×1696   (0.47, PORTRAIT)
 *     width=800&resize=contain → 800×537 (1.49, correct)
 *
 * The damage was invisible for a long time because covers used to be 1200×630,
 * so the returned height was small enough to look plausible; when Letterbrace
 * moved covers to 3:2 at full resolution the returned height tripled and every
 * cover became a tall, heavily-cropped slice of the original artwork.
 */
export function sizedCover(url: string, width: number): string {
  if (!url.includes(SUPABASE_OBJECT_PATH)) return url;
  const rendered = url.replace(SUPABASE_OBJECT_PATH, SUPABASE_RENDER_PATH);
  const sep = rendered.includes("?") ? "&" : "?";
  return `${rendered}${sep}width=${width}&resize=contain&quality=70`;
}

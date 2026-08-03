import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import manifestData from "./generated/redirect-manifest.json";

/**
 * Redirect old /posts/* and /sections/* URLs that a re-strategize removed (but
 * Google still has indexed) to the homepage with a 308, instead of serving a
 * dead 404 that wastes the URL's ranking equity.
 *
 * The valid slugs are baked into `generated/redirect-manifest.json` at BUILD
 * time (scripts/gen-redirect-manifest.mts) — there is NO request-time API call
 * here (an earlier attempt that resolved posts on-demand hung the render). A
 * known post/section just costs a Set lookup before it renders.
 *
 * Fail-safe: if the manifest didn't generate (`ok: false`) or a slug list is
 * empty, we do nothing — so a bad/missing manifest can only ever fall back to
 * today's plain 404, never redirect a valid page.
 */
type RedirectManifest = { ok: boolean; postSlugs: string[]; sectionSlugs: string[] };
const manifest = manifestData as RedirectManifest;
const postSlugs = new Set(manifest.postSlugs);
const sectionSlugs = new Set(manifest.sectionSlugs);

function safeDecode(segment: string): string {
	try {
		return decodeURIComponent(segment);
	} catch {
		return segment;
	}
}

export function middleware(req: NextRequest): NextResponse {
	if (!manifest.ok) return NextResponse.next();
	const { pathname } = req.nextUrl;

	const post = /^\/posts\/([^/]+)\/?$/.exec(pathname);
	if (post && postSlugs.size > 0 && !postSlugs.has(safeDecode(post[1]))) {
		return NextResponse.redirect(new URL("/", req.url), 308);
	}

	const section = /^\/sections\/([^/]+)\/?$/.exec(pathname);
	if (section && sectionSlugs.size > 0 && !sectionSlugs.has(safeDecode(section[1]))) {
		return NextResponse.redirect(new URL("/", req.url), 308);
	}

	return NextResponse.next();
}

// Only run for individual post/section pages — never the homepage, assets, etc.
export const config = { matcher: ["/posts/:slug", "/sections/:slug"] };

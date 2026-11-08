// Shipped into every replica as `lib/markdown.ts`, and used by the Replicator to check that an
// item's body survives as Markdown. One renderer, so what was checked is what is served. A phantom
// moved to code renders its posts with it too (Lettersprite's `src/lib/letterbrace/markdown.ts`,
// written with this file's bytes when the site moves: docs/architecture/phantom-code.md).
//
// A collection's body is plain Markdown; how it looks is the site's own: each element gets the
// attributes the original site's rich text gave it (its classes), external links get what the
// site gave its external links (a new tab), and an image standing alone stays a bare image when
// that is how the site's bodies had them. All of it read off the original items and kept with
// the collection as data. HTML written into the Markdown (an embed, an image sized apart) is the
// site's markup as it was: it is passed through untouched, never given the site's attributes.
import { Marked } from "marked";

/** Per tag, the attributes the site's rich text gives that element. */
export type TagAttrs = Record<string, Record<string, string>>;

export interface BodyStyle {
	tags: TagAttrs;
	/** Attributes every link off the site carries (`target="_blank"`). */
	externalLinks?: Record<string, string>;
	/** An image on its own line is a bare `<img>`, not wrapped in a paragraph. */
	bareImages?: boolean;
}

const escAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function addAttrs(own: string, add: Record<string, string>): string {
	let extra = "";
	for (const [name, value] of Object.entries(add)) {
		if (new RegExp(`\\s${name}(=|\\s|$)`).test(own)) continue;
		extra += value === "" ? ` ${name}` : ` ${name}="${escAttr(value)}"`;
	}
	return extra;
}

/**
 * Block elements Markdown makes. The line breaks marked writes between their tags are not the
 * site's: a site whose rich text keeps whitespace (`white-space: pre-wrap`) would draw them as lines.
 */
const BLOCKS = "p|h[1-6]|ul|ol|li|blockquote|pre|hr|table|thead|tbody|tr|th|td";
const SPACE_AFTER_BLOCK = new RegExp(`(</?(?:${BLOCKS})(?=[\\s>/])[^>]*>)[ \\t\\n\\f\\r]+(?=<|$)`, "g");
const SPACE_BEFORE_BLOCK = new RegExp(`(^|>)[ \\t\\n\\f\\r]+(?=</?(?:${BLOCKS})(?=[\\s>/]))`, "g");

/** Around HTML the Markdown carried as it was, while the site's attributes are added elsewhere. */
const RAW_OPEN = "\uE000";
const RAW_CLOSE = "\uE001";

const markdown = new Marked({
	async: false,
	gfm: true,
	breaks: false,
	renderer: {
		html({ text, block }) {
			// An HTML block's line break is Markdown's, not the site's.
			return `${RAW_OPEN}${block ? text.replace(/[\n\r]+$/, "") : text}${RAW_CLOSE}`;
		},
	},
});

/**
 * Add the site's attributes to every opening tag marked produced (attributes already set win); HTML
 * the Markdown carried as it was (between RAW_OPEN and RAW_CLOSE) is left exactly as written.
 */
export function withSiteAttrs(html: string, style: BodyStyle): string {
	return html
		.split(new RegExp(`(${RAW_OPEN}[\\s\\S]*?${RAW_CLOSE})`))
		.map((part) => {
			if (part.startsWith(RAW_OPEN)) return part.slice(1, -1);
			let out = part.replace(SPACE_AFTER_BLOCK, "$1").replace(SPACE_BEFORE_BLOCK, "$1");
			if (style.bareImages) out = out.replace(/<p>(<img\s[^<>]*>)<\/p>/g, "$1");
			return out.replace(
				/<([a-z][a-z0-9]*)(\s[^<>]*?)?(\/?)>/g,
				(whole, tag: string, rest: string | undefined, slash: string) => {
					const own = rest ?? "";
					let extra = style.tags[tag] ? addAttrs(own, style.tags[tag]) : "";
					if (tag === "a" && style.externalLinks && /\shref="https?:\/\//.test(own))
						extra += addAttrs(own + extra, style.externalLinks);
					return extra ? `<${tag}${extra}${own}${slash}>` : whole;
				}
			);
		})
		.join("");
}

/** An item's body as HTML: Markdown rendered in the site's style, or HTML kept as it was. */
export function renderBody(body: string, format: "markdown" | "html", style: BodyStyle): string {
	if (format === "html") return body;
	return withSiteAttrs(markdown.parse(body) as string, style);
}

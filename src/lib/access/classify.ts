/**
 * Who is asking for this page?
 *
 * The entire access feature rests on this function, so it is a pure one — no
 * request object, no network, no environment. It takes a user-agent string and
 * returns a classification, which means it can be tested exhaustively against
 * real UA strings without standing up a server.
 *
 * WHAT THIS CAN AND CANNOT KNOW. A user-agent is a self-declaration. Anyone can
 * send `GPTBot` and nothing here would know better — real verification means
 * reverse DNS or checking published IP ranges per vendor, which is a different
 * and much larger piece of work. So this function reports what the requester
 * CLAIMS, and the storage layer records that claim as unverified. The honest
 * framing is "this is what identified itself as ChatGPT", and every number
 * built on it inherits that caveat.
 *
 * The reason it is still worth doing: the agents we care about have no reason
 * to lie. GPTBot announces itself because it wants publishers to allow it in
 * robots.txt. The failure mode is someone impersonating a crawler, which
 * inflates a vanity metric — not something that grants access or costs money.
 */

/** Kept in lockstep with REQUESTER_CLASSES in Letterbrace's phantom-access/report.ts
 *  and the CHECK constraint on phantom_page_access. */
export type RequesterClass = "ai_agent" | "search_crawler" | "other_bot" | "browser";

export interface Requester {
	class: RequesterClass;
	/** The named agent, or "" when we can't name one. Never null — the storage
	 *  column is part of a unique key and NULLs would defeat the upsert. */
	agent: string;
}

/**
 * Named AI agents, matched against the lower-cased user-agent.
 *
 * Order matters: the first match wins, so more specific tokens come first.
 * `google-extended` must precede any Googlebot rule, because it is Google's
 * AI-training fetcher rather than its search crawler and the distinction is
 * exactly what this feature exists to draw.
 *
 * Every `agent` label emitted here MUST also appear in Letterbrace's
 * KNOWN_AGENTS (src/lib/phantom-access/report.ts) — a label named here but
 * missing there is silently blanked at ingest. Add to both in the same change.
 */
const AI_AGENTS: [pattern: string, agent: string][] = [
	// OpenAI runs three, and they mean different things: GPTBot trains, OAI-SearchBot
	// builds the search index, ChatGPT-User fetches a page live to answer someone.
	// All three are "ChatGPT read this" for our purposes; the distinction between
	// them is finer than any question we're currently asking.
	["gptbot", "chatgpt"],
	["oai-searchbot", "chatgpt"],
	["chatgpt-user", "chatgpt"],
	["anthropic-ai", "claude"],
	["claudebot", "claude"],
	["claude-web", "claude"],
	["claude-user", "claude"],
	["claude-searchbot", "claude"],
	["perplexitybot", "perplexity"],
	["perplexity-user", "perplexity"],
	["google-extended", "gemini"],
	["gemini-deep-research", "gemini"],
	// Meta and Bytedance ship AI crawlers too. Named so they don't fall into the
	// anonymous bucket, but not surfaced as one of the four headline assistants.
	["meta-externalagent", "meta"],
	["bytespider", "bytedance"],
	["ccbot", "commoncrawl"],
	["applebot-extended", "apple"],
];

/** Conventional search crawlers — indexing for a results page, not an answer. */
const SEARCH_CRAWLERS: [pattern: string, agent: string][] = [
	["googlebot", "google"],
	["bingbot", "bing"],
	["duckduckbot", ""],
	["yandexbot", ""],
	["baiduspider", ""],
	["slurp", ""],
	["applebot", "apple"],
];

/**
 * Generic automation markers.
 *
 * Checked LAST, and only as whole-ish tokens, because these substrings appear
 * inside legitimate browser UAs — `Mozilla/5.0 (X11; Linux)` contains neither,
 * but a naive `includes("bot")` would catch "Cubot" (a phone brand that appears
 * in real Android UAs) and misfile a human as a robot. The cost of that error
 * is a permanently understated human count, which is the number a client cares
 * most about.
 */
const BOT_TOKENS = [
	"bot/",
	"bot;",
	"bot)",
	" bot",
	"spider",
	"crawler",
	"crawl;",
	"scrapy",
	"curl/",
	"wget/",
	"python-requests",
	"httpx/",
	"go-http-client",
	"java/",
	"okhttp",
	"headlesschrome",
	"phantomjs",
	"puppeteer",
	"playwright",
	"lighthouse",
	"axios/",
	"node-fetch",
];

/**
 * A browser announces itself with a rendering-engine token. Requiring one of
 * these (rather than merely failing to look like a bot) is what keeps an empty
 * or junk user-agent out of the human count — silence should never be read as
 * a person.
 */
const BROWSER_MARKERS = ["mozilla/", "applewebkit", "gecko/", "chrome/", "safari/", "firefox/", "edg/", "opera"];

export function classifyRequester(userAgent: string | null | undefined): Requester {
	const ua = (userAgent ?? "").toLowerCase().trim();

	// No user-agent at all is automation of some kind. A browser always sends one.
	if (!ua) return { class: "other_bot", agent: "" };

	for (const [pattern, agent] of AI_AGENTS) {
		if (ua.includes(pattern)) return { class: "ai_agent", agent };
	}

	for (const [pattern, agent] of SEARCH_CRAWLERS) {
		if (ua.includes(pattern)) return { class: "search_crawler", agent };
	}

	for (const token of BOT_TOKENS) {
		if (ua.includes(token)) return { class: "other_bot", agent: "" };
	}

	if (BROWSER_MARKERS.some((marker) => ua.includes(marker))) {
		// "Looks like a browser", which is the strongest claim available from a
		// header alone. Whether a PERSON was driving it is a separate question,
		// answered later by whether the client beacon ever runs.
		return { class: "browser", agent: "" };
	}

	// Identified itself as something, but nothing we recognise as a browser.
	return { class: "other_bot", agent: "" };
}

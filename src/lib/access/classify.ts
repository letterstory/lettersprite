/**
 * Who is asking for this page?
 *
 * The entire access feature rests on this function, so it is a pure one — no
 * request object, no network, no environment. It takes a user-agent string
 * (and optionally the classifier tables) and returns a classification, which
 * means it can be tested exhaustively against real UA strings without standing
 * up a server.
 *
 * THE TABLES ARE DATA, NOT CODE. Letterbrace's bot registry is the single
 * source of truth (src/lib/phantom-access/registry.ts over there); this file
 * ships an EMBEDDED copy as the last-resort fallback, and the proxy prefers
 * the classifier manifest — baked at build time, refreshed about daily at
 * runtime (see manifest.ts). A newly-discovered bot is named by editing the
 * registry, and every deployment picks it up within a day with no release.
 * Keep the embedded copy roughly current when touching this file, but its
 * staleness only ever costs naming precision, never correctness.
 *
 * WHAT THIS CAN AND CANNOT KNOW. A user-agent is a self-declaration. Anyone
 * can send `GPTBot` and nothing HERE would know better — that's what the
 * IP-range verification in the proxy adds (`verified` on the report): the
 * claim gets checked against the vendor's own published ranges, out of band.
 * This function still reports what the requester CLAIMS; the verified flag
 * records whether the claim held.
 */

/** Kept in lockstep with REQUESTER_CLASSES in Letterbrace's phantom-access/report.ts
 *  and the CHECK constraint on phantom_page_access. */
export type RequesterClass = "ai_agent" | "search_crawler" | "other_bot" | "browser";

/**
 * WHY a request happened, not just who sent it — the axis that answers "is
 * this real interest, or a routine sweep?" Mirrors registry.ts's FetchPurpose
 * exactly (see that file's doc-comment for the full taxonomy and the incident
 * — a single site logging 441 Meta requests and 385 Gemini requests that were
 * almost entirely routine training/index sweeps — that prompted this axis).
 */
export type FetchPurpose = "training" | "index" | "live";

export interface Requester {
	class: RequesterClass;
	/** The named agent, or "" when we can't name one. Never null — the storage
	 *  column is part of a unique key and NULLs would defeat the upsert. */
	agent: string;
	/** '' when unnamed (an unclaimed agent has no purpose to claim) or when
	 *  the matched table carries no meaningful purpose (search crawlers/named
	 *  other-bots always report a placeholder "index" purpose upstream, which
	 *  the ingest treats as inert for those classes — see registry.ts). */
	purpose: FetchPurpose | "";
}

/** [ua substring (lower-case), agent label, why this kind of request happens].
 *  ORDER MATTERS — first match wins, so more specific tokens precede the
 *  general ones they contain. */
export type PatternRow = [pattern: string, agent: string, purpose: FetchPurpose];

/** The classifier's working set — the manifest serves this exact shape. */
export interface ClassifierTables {
	version: number;
	aiAgents: PatternRow[];
	searchCrawlers: PatternRow[];
	namedOtherBots: PatternRow[];
	botTokens: string[];
	browserMarkers: string[];
}

/**
 * The embedded fallback tables — a snapshot of Letterbrace's registry
 * (2026-08-04, v4: purpose taxonomy + evidence re-mappings — oai-adsbot is
 * index not live, facebookexternalhit is a link previewer not an AI agent).
 * Used only when neither the baked manifest nor a runtime refresh is
 * available.
 *
 * Ordering rules preserved from the registry:
 * - AI table before search: `google-agent`/`googleother` are Google's AI side
 *   and must not fall through to the `googlebot` crawler rule.
 * - namedOtherBots before the generic bot tokens AND before browser markers:
 *   "AhrefsBot/7.0" contains "bot/" (would lose its name to the generic
 *   bucket), and StatusCake/BetterStack wear complete Chrome UAs with only a
 *   trailing token (would count as browsers forever).
 */
export const EMBEDDED_TABLES: ClassifierTables = {
	version: 4,
	aiAgents: [
		// OpenAI: GPTBot trains, OAI-SearchBot indexes, ChatGPT-User fetches live
		// (and carries agent-mode browsing). OAI-AdsBot validates ad landing
		// pages — an automated check, not a person asking, so it must not carry
		// the live label that mints "an AI read this" claims upstream.
		["gptbot", "chatgpt", "training"],
		["oai-searchbot", "chatgpt", "index"],
		["oai-adsbot", "chatgpt", "index"],
		["chatgpt-user", "chatgpt", "live"],
		["anthropic-ai", "claude", "training"],
		["claudebot", "claude", "training"],
		["claude-web", "claude", "training"],
		["claude-user", "claude", "live"],
		["claude-searchbot", "claude", "index"],
		["claude-code", "claude", "live"],
		// `google-agent` is the consolidated agentic-browsing UA (absorbed
		// Gemini-Deep-Research / Mariner in 2026).
		["google-agent", "gemini", "live"],
		["google-gemininotebook", "gemini", "live"],
		["google-notebooklm", "gemini", "live"],
		["google-cloudvertexbot", "gemini", "index"],
		["gemini-deep-research", "gemini", "live"],
		["google-extended", "gemini", "training"],
		["googleother", "gemini", "index"],
		["perplexitybot", "perplexity", "index"],
		["perplexity-user", "perplexity", "live"],
		["duckassistbot", "duckduckgo", "live"],
		["mistralai-user", "mistral", "live"],
		["mistralai-index", "mistral", "index"],
		["mistralai-training", "mistral", "training"],
		["amzn-searchbot", "amazon", "index"],
		["amzn-user", "amazon", "live"],
		["amazonbot", "amazon", "training"],
		["meta-externalagent", "meta", "training"],
		["meta-externalfetcher", "meta", "live"],
		["meta-webindexer", "meta", "index"],
		["meta-externalads", "meta", "index"],
		// facebookexternalhit lives in namedOtherBots now — a link-preview fetch
		// (same behavior as Slack/Discord), not an AI product reading a page.
		["facebookbot", "meta", "training"],
		["tiktokspider", "bytedance", "training"],
		["bytespider", "bytedance", "training"],
		["ccbot", "commoncrawl", "training"],
		["applebot-extended", "apple", "training"],
		["cohere-training-data-crawler", "cohere", "training"],
		["cohere-ai", "cohere", "training"],
		["ai2bot", "ai2", "training"],
		["youbot", "you", "index"],
		["petalbot", "huawei", "index"],
		["pangubot", "huawei", "training"],
		["deepseekbot", "deepseek", "training"],
		["kimi-user", "moonshot", "live"],
		["linkupbot", "linkup", "index"],
		["firecrawlagent", "firecrawl", "live"],
		["tavilybot", "tavily", "index"],
		["diffbot", "diffbot", "index"],
		["timpibot", "timpi", "index"],
		// Defensive: xAI has no documented crawler; if one ever announces itself
		// with the obvious name, catch it on day one.
		["grokbot", "xai", "training"],
	],
	searchCrawlers: [
		["googlebot", "google", "index"],
		["storebot-google", "google", "index"],
		["google-inspectiontool", "google", "index"],
		["bingbot", "bing", "index"],
		["adidxbot", "bing", "index"],
		["bingpreview", "bing", "live"],
		["microsoftpreview", "bing", "live"],
		["duckduckbot", "duckduckgo", "index"],
		["yandexbot", "yandex", "index"],
		["baiduspider", "baidu", "index"],
		["slurp", "", "index"],
		["applebot", "apple", "index"],
	],
	namedOtherBots: [
		// Vercel's deployment screenshotter — the platform photographing its own
		// deploys. It egresses from AWS, which is exactly why the UA pass runs
		// before any IP-provenance logic: UA beats IP, always.
		["vercel-screenshot", "vercel", "index"],
		["vercelbot", "vercel", "index"],
		["ahrefsbot", "ahrefs", "index"],
		["semrushbot", "semrush", "index"],
		["dataforseobot", "dataforseo", "index"],
		["dotbot", "moz", "index"],
		["mj12bot", "majestic", "index"],
		["screaming frog", "screamingfrog", "index"],
		["blexbot", "blexbot", "index"],
		["serpstatbot", "serpstat", "index"],
		["uptimerobot", "uptimerobot", "index"],
		["pingdom", "pingdom", "index"],
		["statuscake", "statuscake", "index"],
		["better uptime bot", "betterstack", "index"],
		["checkly", "checkly", "index"],
		["datadogsynthetics", "datadog", "index"],
		["facebookexternalhit", "meta", "live"],
		["slackbot", "slack", "live"],
		["twitterbot", "x", "live"],
		["discordbot", "discord", "live"],
		["telegrambot", "telegram", "live"],
		["whatsapp", "whatsapp", "live"],
		["linkedinbot", "linkedin", "live"],
		["censysinspect", "censys", "index"],
		["expanse,", "paloalto", "index"],
		["internetmeasurement", "driftnet", "index"],
	],
	// Generic automation markers — checked LAST among bots, as whole-ish tokens,
	// because these substrings appear inside legitimate browser UAs: a naive
	// includes("bot") would catch "Cubot" (a phone brand in real Android UAs)
	// and misfile a human as a robot.
	botTokens: [
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
	],
	// A browser announces itself with a rendering-engine token. Requiring one
	// (rather than merely failing to look like a bot) keeps an empty or junk
	// user-agent out of the human count — silence should never read as a person.
	browserMarkers: ["mozilla/", "applewebkit", "gecko/", "chrome/", "safari/", "firefox/", "edg/", "opera"],
};

export function classifyRequester(
	userAgent: string | null | undefined,
	tables: ClassifierTables = EMBEDDED_TABLES
): Requester {
	const ua = (userAgent ?? "").toLowerCase().trim();

	// No user-agent at all is automation of some kind. A browser always sends one.
	if (!ua) return { class: "other_bot", agent: "", purpose: "" };

	for (const [pattern, agent, purpose] of tables.aiAgents) {
		if (ua.includes(pattern)) return { class: "ai_agent", agent, purpose };
	}

	for (const [pattern, agent, purpose] of tables.searchCrawlers) {
		if (ua.includes(pattern)) return { class: "search_crawler", agent, purpose };
	}

	// Named non-AI automation BEFORE the generic tokens and browser markers —
	// see the ordering note on EMBEDDED_TABLES.
	for (const [pattern, agent, purpose] of tables.namedOtherBots) {
		if (ua.includes(pattern)) return { class: "other_bot", agent, purpose };
	}

	for (const token of tables.botTokens) {
		if (ua.includes(token)) return { class: "other_bot", agent: "", purpose: "" };
	}

	if (tables.browserMarkers.some((marker) => ua.includes(marker))) {
		// "Looks like a browser", which is the strongest claim available from a
		// header alone. Whether a PERSON was driving it is a separate question,
		// answered later by whether the client beacon ever runs — and, now, by
		// whether the IP resolves to a datacenter (the provenance label).
		return { class: "browser", agent: "", purpose: "" };
	}

	// Identified itself as something, but nothing we recognise as a browser.
	return { class: "other_bot", agent: "", purpose: "" };
}

// ---------------------------------------------------------------------------
// Discovery: what did an UNNAMED bot call itself?
// ---------------------------------------------------------------------------

/** Product-token names that identify software everyone runs, not a bot worth
 *  discovering. Extracting "mozilla" or "curl" would flood the ledger with
 *  the least interesting strings on the internet. */
const GENERIC_PRODUCT_NAMES = new Set([
	"mozilla",
	"applewebkit",
	"chrome",
	"safari",
	"firefox",
	"gecko",
	"khtml",
	"version",
	"mobile",
	"edg",
	"edge",
	"opera",
	"opr",
	"like",
	"compatible",
	"curl",
	"wget",
	"httpx",
	"okhttp",
	"axios",
	"node-fetch",
	"node",
	"python",
	"python-requests",
	"python-urllib",
	"go-http-client",
	"java",
	"dalvik",
	"scrapy",
	"aiohttp",
	"got",
	"undici",
]);

const GENERIC_BOT_WORDS = new Set(["bot", "robot", "bots", "crawler", "spider"]);

/**
 * Extract the self-identification token from an automation UA the classifier
 * could not name — the discovery ledger's raw material ("FooBot/1.2 (+…)" →
 * "foobot"). Returns '' when there is nothing worth keeping.
 *
 * Deliberately called ONLY for `other_bot` rows with no named agent: a plain
 * browser UA is all generic product tokens, and a named bot needs no
 * discovering. Two shapes are recognised, most-specific first:
 *
 *   1. a product token `name/version` whose name isn't generic software
 *   2. a bare word containing bot/crawler/spider ("FooBot (+https://foo.ai)")
 *
 * The output charset/length mirror what Letterbrace's ingest (and the
 * database's CHECK constraint) will accept — anything else is dropped here
 * rather than shipped to be dropped there.
 */
export function extractBotToken(userAgent: string | null | undefined): string {
	const ua = (userAgent ?? "").toLowerCase().trim();
	if (!ua) return "";

	for (const match of ua.matchAll(/([a-z0-9][a-z0-9_.-]{1,39})\/\d/g)) {
		const name = match[1];
		if (!GENERIC_PRODUCT_NAMES.has(name) && !GENERIC_BOT_WORDS.has(name)) return name;
	}

	for (const match of ua.matchAll(/(?:^|[\s;(])([a-z0-9_.-]*(?:bot|crawler|spider)[a-z0-9_.-]*)(?:$|[\s;)+,])/g)) {
		const word = match[1];
		if (word.length >= 2 && word.length <= 40 && !GENERIC_BOT_WORDS.has(word)) return word;
	}

	return "";
}

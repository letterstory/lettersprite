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

export interface Requester {
	class: RequesterClass;
	/** The named agent, or "" when we can't name one. Never null — the storage
	 *  column is part of a unique key and NULLs would defeat the upsert. */
	agent: string;
}

/** [ua substring (lower-case), agent label]. Order matters: first match wins. */
export type PatternRow = [pattern: string, agent: string];

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
 * (2026-08-03 audit of official vendor bot docs). Used only when neither the
 * baked manifest nor a runtime refresh is available.
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
	version: 2,
	aiAgents: [
		// OpenAI: GPTBot trains, OAI-SearchBot indexes, ChatGPT-User fetches live,
		// OAI-AdsBot validates ad landing pages.
		["gptbot", "chatgpt"],
		["oai-searchbot", "chatgpt"],
		["oai-adsbot", "chatgpt"],
		["chatgpt-user", "chatgpt"],
		["anthropic-ai", "claude"],
		["claudebot", "claude"],
		["claude-web", "claude"],
		["claude-user", "claude"],
		["claude-searchbot", "claude"],
		["claude-code", "claude"],
		// `google-agent` is the consolidated agentic-browsing UA (absorbed
		// Gemini-Deep-Research / Mariner in 2026).
		["google-agent", "gemini"],
		["google-gemininotebook", "gemini"],
		["google-notebooklm", "gemini"],
		["google-cloudvertexbot", "gemini"],
		["gemini-deep-research", "gemini"],
		["google-extended", "gemini"],
		["googleother", "gemini"],
		["perplexitybot", "perplexity"],
		["perplexity-user", "perplexity"],
		["duckassistbot", "duckduckgo"],
		["mistralai-user", "mistral"],
		["mistralai-index", "mistral"],
		["mistralai-training", "mistral"],
		["amzn-searchbot", "amazon"],
		["amzn-user", "amazon"],
		["amazonbot", "amazon"],
		["meta-externalagent", "meta"],
		["meta-externalfetcher", "meta"],
		["meta-webindexer", "meta"],
		["meta-externalads", "meta"],
		["facebookexternalhit", "meta"],
		["facebookbot", "meta"],
		["tiktokspider", "bytedance"],
		["bytespider", "bytedance"],
		["ccbot", "commoncrawl"],
		["applebot-extended", "apple"],
		["cohere-training-data-crawler", "cohere"],
		["cohere-ai", "cohere"],
		["ai2bot", "ai2"],
		["youbot", "you"],
		["petalbot", "huawei"],
		["pangubot", "huawei"],
		["deepseekbot", "deepseek"],
		["kimi-user", "moonshot"],
		["linkupbot", "linkup"],
		["firecrawlagent", "firecrawl"],
		["tavilybot", "tavily"],
		["diffbot", "diffbot"],
		["timpibot", "timpi"],
		["grokbot", "xai"],
	],
	searchCrawlers: [
		["googlebot", "google"],
		["storebot-google", "google"],
		["google-inspectiontool", "google"],
		["bingbot", "bing"],
		["adidxbot", "bing"],
		["bingpreview", "bing"],
		["microsoftpreview", "bing"],
		["duckduckbot", "duckduckgo"],
		["yandexbot", "yandex"],
		["baiduspider", "baidu"],
		["slurp", ""],
		["applebot", "apple"],
	],
	namedOtherBots: [
		// Vercel's deployment screenshotter — the platform photographing its own
		// deploys. It egresses from AWS, which is exactly why the UA pass runs
		// before any IP-provenance logic: UA beats IP, always.
		["vercel-screenshot", "vercel"],
		["vercelbot", "vercel"],
		["ahrefsbot", "ahrefs"],
		["semrushbot", "semrush"],
		["dataforseobot", "dataforseo"],
		["dotbot", "moz"],
		["mj12bot", "majestic"],
		["screaming frog", "screamingfrog"],
		["blexbot", "blexbot"],
		["serpstatbot", "serpstat"],
		["uptimerobot", "uptimerobot"],
		["pingdom", "pingdom"],
		["statuscake", "statuscake"],
		["better uptime bot", "betterstack"],
		["checkly", "checkly"],
		["datadogsynthetics", "datadog"],
		["slackbot", "slack"],
		["twitterbot", "x"],
		["discordbot", "discord"],
		["telegrambot", "telegram"],
		["whatsapp", "whatsapp"],
		["linkedinbot", "linkedin"],
		["censysinspect", "censys"],
		["expanse,", "paloalto"],
		["internetmeasurement", "driftnet"],
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
	if (!ua) return { class: "other_bot", agent: "" };

	for (const [pattern, agent] of tables.aiAgents) {
		if (ua.includes(pattern)) return { class: "ai_agent", agent };
	}

	for (const [pattern, agent] of tables.searchCrawlers) {
		if (ua.includes(pattern)) return { class: "search_crawler", agent };
	}

	// Named non-AI automation BEFORE the generic tokens and browser markers —
	// see the ordering note on EMBEDDED_TABLES.
	for (const [pattern, agent] of tables.namedOtherBots) {
		if (ua.includes(pattern)) return { class: "other_bot", agent };
	}

	for (const token of tables.botTokens) {
		if (ua.includes(token)) return { class: "other_bot", agent: "" };
	}

	if (tables.browserMarkers.some((marker) => ua.includes(marker))) {
		// "Looks like a browser", which is the strongest claim available from a
		// header alone. Whether a PERSON was driving it is a separate question,
		// answered later by whether the client beacon ever runs — and, now, by
		// whether the IP resolves to a datacenter (the provenance label).
		return { class: "browser", agent: "" };
	}

	// Identified itself as something, but nothing we recognise as a browser.
	return { class: "other_bot", agent: "" };
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

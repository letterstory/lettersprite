import { describe, it, expect } from "vitest";
import { classifyRequester, extractBotToken, EMBEDDED_TABLES } from "./classify";

/**
 * Real user-agent strings, copied from what these clients actually send.
 * Synthesised UAs would test the regex against itself; the point of this file
 * is to test it against the world.
 */
const UA = {
	gptbot: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot",
	chatgptUser:
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36; compatible; ChatGPT-User/1.0; +https://openai.com/bot",
	oaiSearch:
		"Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot",
	claudeBot: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ClaudeBot/1.0; +claudebot@anthropic.com",
	anthropicAi: "anthropic-ai",
	perplexity: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; PerplexityBot/1.0; +https://perplexity.ai/bot",
	googleExtended: "Mozilla/5.0 (compatible; Google-Extended/1.0; +http://www.google.com/bot.html)",
	googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
	bingbot: "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
	chromeMac:
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
	safariIphone:
		"Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
	firefox: "Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0",
	// A real Android phone whose model name contains "bot" — the string that
	// breaks a naive includes("bot") check and misfiles a person as a robot.
	cubot:
		"Mozilla/5.0 (Linux; Android 11; CUBOT NOTE 20 PRO) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
	curl: "curl/8.4.0",
	python: "python-requests/2.31.0",
};

describe("named AI agents", () => {
	it("recognises all three OpenAI fetchers as ChatGPT, with DIFFERENT purposes", () => {
		// The whole point of the purpose axis: GPTBot trains (a routine sweep),
		// OAI-SearchBot indexes (also routine), ChatGPT-User fetches live (someone
		// asked a question right now). Collapsing these into one identical result
		// is exactly the bug that let a training sweep read as "AI interest."
		expect(classifyRequester(UA.gptbot)).toEqual({ class: "ai_agent", agent: "chatgpt", purpose: "training" });
		expect(classifyRequester(UA.oaiSearch)).toEqual({ class: "ai_agent", agent: "chatgpt", purpose: "index" });
		expect(classifyRequester(UA.chatgptUser)).toEqual({ class: "ai_agent", agent: "chatgpt", purpose: "live" });
	});

	it("recognises Anthropic's crawlers as training-purpose", () => {
		expect(classifyRequester(UA.claudeBot)).toEqual({ class: "ai_agent", agent: "claude", purpose: "training" });
		expect(classifyRequester(UA.anthropicAi)).toEqual({ class: "ai_agent", agent: "claude", purpose: "training" });
	});

	it("recognises Perplexity's index bot", () => {
		expect(classifyRequester(UA.perplexity)).toEqual({ class: "ai_agent", agent: "perplexity", purpose: "index" });
	});

	it("separates Google-Extended from Googlebot", () => {
		// The distinction this whole feature exists to draw: Google-Extended is
		// the AI fetcher, Googlebot is search indexing. Collapsing them would put
		// ordinary SEO crawling into the "AI is reading us" number.
		expect(classifyRequester(UA.googleExtended)).toEqual({ class: "ai_agent", agent: "gemini", purpose: "training" });
		expect(classifyRequester(UA.googlebot)).toEqual({ class: "search_crawler", agent: "google", purpose: "index" });
	});

	it("is case-insensitive", () => {
		expect(classifyRequester(UA.gptbot.toUpperCase()).agent).toBe("chatgpt");
		expect(classifyRequester(UA.claudeBot.toLowerCase()).agent).toBe("claude");
	});
});

describe("search crawlers", () => {
	it("recognises the conventional ones, purpose-tagged index", () => {
		expect(classifyRequester(UA.bingbot)).toEqual({ class: "search_crawler", agent: "bing", purpose: "index" });
		expect(classifyRequester(UA.googlebot).class).toBe("search_crawler");
	});
});

describe("browsers", () => {
	it("classifies real browsers as browsers, with no purpose to claim", () => {
		for (const ua of [UA.chromeMac, UA.safariIphone, UA.firefox]) {
			expect(classifyRequester(ua)).toEqual({ class: "browser", agent: "", purpose: "" });
		}
	});

	it("does not misfile a phone whose model contains 'bot'", () => {
		// CUBOT is a real Android manufacturer. A substring check for "bot" reads
		// this human as automation, and the error is invisible: it only ever
		// understates the human count, which is the number a client looks at.
		expect(classifyRequester(UA.cubot)).toEqual({ class: "browser", agent: "", purpose: "" });
	});
});

describe("generic automation", () => {
	it("catches command-line and library clients", () => {
		expect(classifyRequester(UA.curl).class).toBe("other_bot");
		expect(classifyRequester(UA.python).class).toBe("other_bot");
	});

	it("treats a missing user-agent as automation, never as a human", () => {
		// Every browser sends one. Counting silence as a person would inflate the
		// number that matters most, in the direction that flatters us.
		for (const ua of [null, undefined, "", "   "]) {
			expect(classifyRequester(ua).class).toBe("other_bot");
		}
	});

	it("treats an unrecognised non-browser string as automation", () => {
		expect(classifyRequester("SomeInternalHealthCheck/2").class).toBe("other_bot");
	});
});

describe("the shape of the answer", () => {
	it("never returns a null agent, whatever the input", () => {
		// The agent column is part of a unique key in Postgres, where NULLs are
		// distinct — a null here would defeat the daily upsert and insert a fresh
		// row per request.
		const inputs = [null, "", UA.chromeMac, UA.curl, UA.gptbot, "\x00garbage"];
		for (const ua of inputs) {
			const result = classifyRequester(ua);
			expect(typeof result.agent).toBe("string");
		}
	});
});

// ---------------------------------------------------------------------------
// The registry expansion (2026-08 audit) — new named agents and the noise
// ---------------------------------------------------------------------------

const UA2 = {
	googleAgent: "Mozilla/5.0 (compatible; Google-Agent/1.0; +https://developers.google.com/crawling)",
	mistralUser: "Mozilla/5.0 (compatible; MistralAI-User/1.0; +https://docs.mistral.ai/robots)",
	amazonbot: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/600.2.5 (KHTML, like Gecko) Version/8.0.2 Safari/600.2.5 (Amazonbot/0.1; +https://developer.amazon.com/support/amazonbot)",
	duckAssist: "Mozilla/5.0 (compatible; DuckAssistBot/1.2; +http://duckduckgo.com/duckassistbot.html)",
	tiktokSpider: "Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; TikTokSpider; ttspider-feedback@tiktok.com)",
	ahrefs: "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
	vercelScreenshot: "vercel-screenshot/1.0",
	vercelbot: "Vercelbot (+https://vercel.com)",
	// The trap this suite exists to pin: a COMPLETE Chrome UA with only a
	// trailing monitor token. Checked after the browser markers, this counts
	// as a person forever.
	statusCake:
		"Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.131 Safari/537.36 (StatusCake)",
	betterStack:
		"Better Uptime Bot Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
	slackExpander: "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
	expanse:
		"Expanse, a Palo Alto Networks company, searches across the global IPv4 space multiple times per day to identify customers' presences on the Internet. If you would like to be excluded from our scans, please send IP addresses/domains to: scaninfo@paloaltonetworks.com",
	newBot: "FooReaderAI/2.1 (+https://fooreader.ai/bot)",
	bareBotWord: "meganewsbot (+https://example.com)",
};

describe("newly named AI agents", () => {
	it("recognises Google-Agent (the consolidated agentic UA) as gemini, purpose live", () => {
		expect(classifyRequester(UA2.googleAgent)).toEqual({ class: "ai_agent", agent: "gemini", purpose: "live" });
	});

	it("recognises Mistral (live), Amazon (training) and DuckAssist (live)", () => {
		expect(classifyRequester(UA2.mistralUser)).toEqual({ class: "ai_agent", agent: "mistral", purpose: "live" });
		expect(classifyRequester(UA2.amazonbot)).toEqual({ class: "ai_agent", agent: "amazon", purpose: "training" });
		expect(classifyRequester(UA2.duckAssist)).toEqual({ class: "ai_agent", agent: "duckduckgo", purpose: "live" });
	});

	it("recognises TikTokSpider alongside Bytespider, both training-purpose", () => {
		expect(classifyRequester(UA2.tiktokSpider)).toEqual({ class: "ai_agent", agent: "bytedance", purpose: "training" });
	});
});

describe("named noise (other_bot with a name)", () => {
	it("names Vercel's own screenshotter — both UA forms", () => {
		expect(classifyRequester(UA2.vercelScreenshot)).toEqual({ class: "other_bot", agent: "vercel", purpose: "index" });
		expect(classifyRequester(UA2.vercelbot)).toEqual({ class: "other_bot", agent: "vercel", purpose: "index" });
	});

	it("names SEO crawlers before the generic bot tokens can eat them", () => {
		// "AhrefsBot/7.0" contains "bot/" — generic-token-first would classify
		// it as anonymous automation and lose the name.
		expect(classifyRequester(UA2.ahrefs)).toEqual({ class: "other_bot", agent: "ahrefs", purpose: "index" });
	});

	it("catches monitors wearing full Chrome user-agents", () => {
		expect(classifyRequester(UA2.statusCake)).toEqual({ class: "other_bot", agent: "statuscake", purpose: "index" });
		expect(classifyRequester(UA2.betterStack)).toEqual({ class: "other_bot", agent: "betterstack", purpose: "index" });
	});

	it("names link expanders and scanners", () => {
		expect(classifyRequester(UA2.slackExpander)).toEqual({ class: "other_bot", agent: "slack", purpose: "live" });
		expect(classifyRequester(UA2.expanse)).toEqual({ class: "other_bot", agent: "paloalto", purpose: "index" });
	});
});

describe("extractBotToken — the discovery ledger's raw material", () => {
	it("extracts a product token from an unrecognised bot", () => {
		expect(extractBotToken(UA2.newBot)).toBe("fooreaderai");
	});

	it("falls back to a bare bot-word when there is no product token", () => {
		expect(extractBotToken(UA2.bareBotWord)).toBe("meganewsbot");
	});

	it("returns '' for generic tooling — curl is not a discovery", () => {
		expect(extractBotToken("curl/8.4.0")).toBe("");
		expect(extractBotToken("python-requests/2.31.0")).toBe("");
		expect(extractBotToken("Go-http-client/1.1")).toBe("");
	});

	it("returns '' for empty or missing user-agents", () => {
		expect(extractBotToken("")).toBe("");
		expect(extractBotToken(null)).toBe("");
	});

	it("never emits characters the ledger's charset would reject", () => {
		for (const ua of [UA2.newBot, UA2.bareBotWord, "Weird<>&Bot/1.0", "ünïbot/2.0"]) {
			const token = extractBotToken(ua);
			expect(token === "" || /^[a-z0-9._-]{2,40}$/.test(token)).toBe(true);
		}
	});
});

describe("tables as data", () => {
	it("classifies with SUPPLIED tables, not just the embedded copy", () => {
		// The longevity contract: a bot named in Letterbrace's registry reaches
		// this function as data. If this breaks, fleet updates silently stop.
		const tables = {
			...EMBEDDED_TABLES,
			aiAgents: [["brandnewbot", "brandnew", "live"] as [string, string, "live"], ...EMBEDDED_TABLES.aiAgents],
		};
		expect(classifyRequester("Mozilla/5.0 (compatible; BrandNewBot/1.0)", tables)).toEqual({
			class: "ai_agent",
			agent: "brandnew",
			purpose: "live",
		});
		// …and the embedded default doesn't know it.
		expect(classifyRequester("Mozilla/5.0 (compatible; BrandNewBot/1.0)").agent).toBe("");
	});
});

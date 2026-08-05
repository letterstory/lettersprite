/**
 * The script that runs in a reader's browser.
 *
 * The proxy sees every request but cannot tell a person from a crawler wearing
 * a browser's user-agent, and it can never see how long anyone stayed. This can
 * — but only for requests that actually execute JavaScript, which is precisely
 * the set the proxy is unsure about. The two halves answer different questions
 * and neither replaces the other.
 *
 * WHAT IT SENDS, AND WHAT IT DELIBERATELY DOESN'T
 *
 *   path            which page (the proxy already knows this; it is the join)
 *   seconds         how long the page was visible, capped
 *   scroll          furthest scroll depth reached, 0-100
 *   from            "chatgpt" | "perplexity" | "google" | "bing" | ... when the
 *                   referrer is a known AI product or search engine, else "" —
 *                   never the raw referrer
 *
 * No identifier, no cookie, no IP, nothing that could distinguish one reader
 * from another or the same reader twice. A visit is a row of numbers, not a
 * person. That is what keeps the whole feature outside consent and PII
 * territory, and it is a constraint rather than an oversight. (One narrow
 * exception: a single non-identifying localStorage FLAG — see below — records
 * "this browser is one of ours," so our own QA browsing doesn't get counted as
 * a reader. It stores a constant, never anything about the visit.)
 *
 * WHO IT REFUSES TO COUNT. The proxy already counts every REQUEST; this beacon
 * exists only to confirm a REAL BROWSER rendered the page. So it declines to
 * fire for the two kinds of "browser" that are not a reader:
 *   - automation (`navigator.webdriver` — Playwright / Puppeteer / headless
 *     Chrome set it), which executes JS and would otherwise mint a phantom
 *     "confirmed visit" indistinguishable from a person; and
 *   - us — a browser that arrived from the Fleet app, or has since been marked
 *     internal, so reviewing a live site in-house never inflates a client's
 *     reader count. On young sites with no real audience that self-counting is
 *     the DOMINANT source of "confirmed" traffic, so excluding it is what makes
 *     the number mean what it says.
 * Both are conservative: when in doubt it still counts. A missed real reader is
 * a smaller lie than a fabricated one.
 *
 * WHY THIS IS A STRING RATHER THAN A MODULE
 *
 * It is inlined into the page. A separate file would be a second request on
 * every page load and a render-blocking one at that, to send a payload smaller
 * than its own headers. It is written to be readable as source, not minified by
 * hand — the build does not process it, so what is here is what ships.
 */

import { env, hasLetterbraceKey } from "@/env";

/** Where the browser posts. Same-origin on purpose — see the collector route. */
export const BEACON_PATH = "/api/access";

/** A visit longer than this is someone who left the tab open, not someone
 *  reading. Capping keeps one abandoned tab from dominating an average. */
const MAX_SECONDS = 1800;

/**
 * Referrer hosts that mean "a person clicked through" — from an AI answer OR
 * from a search engine. Both are conversion (a human arriving), the other half
 * of the two events the schema keeps apart from an agent's retrieval fetch.
 *
 * Search engines are the independent cross-check on Google Search Console: GSC
 * knows Google clicks authoritatively, and this catches the same arrival (plus
 * Bing/DuckDuckGo/etc. that GSC never sees) from the browser's own referrer —
 * two eyes on the event, reconciled by neither.
 *
 * Only the host is ever read — never the full referrer, which can carry a
 * conversation id or a search query. Kept in lockstep with charlotte's
 * referrer-sources.ts (the ingest allowlist derives from the same token set).
 *
 * The `from` token order is AI first, then search; the matcher (cameFrom) takes
 * the first host suffix that matches. Google's gemini/bard entries precede the
 * bare "google.com" search entry so an AI referral is never misread as search.
 */
const REFERRERS: [match: string, from: string][] = [
	// AI answer engines
	["chatgpt.com", "chatgpt"],
	["chat.openai.com", "chatgpt"],
	["openai.com", "chatgpt"],
	["claude.ai", "claude"],
	["perplexity.ai", "perplexity"],
	["gemini.google.com", "gemini"],
	["bard.google.com", "gemini"],
	["copilot.microsoft.com", "copilot"],
	// Search engines (the GSC cross-check). Google referrals arrive from the
	// country TLD too (google.co.uk, …); "google.com" catches the dominant share,
	// and GSC remains the authoritative Google source, so the tail is acceptable.
	["google.com", "google"],
	["bing.com", "bing"],
	["duckduckgo.com", "duckduckgo"],
	["search.yahoo.com", "yahoo"],
	["ecosia.org", "ecosia"],
	["search.brave.com", "brave"],
];

export function beaconEnabled(): boolean {
	return Boolean(env.accessReportUrl && hasLetterbraceKey);
}

/** The URL marker the Fleet app appends to a phantom link when WE open it for
 *  review. Its only job is to teach the beacon "this browser is internal" so
 *  our own QA never counts as a client's reader. Any form is honored
 *  (`?lb_internal=1`, `&lb_internal=1`, `#lb_internal=1`) since a static site
 *  may carry it in the query or the hash. */
export const BEACON_INTERNAL_MARKER = "lb_internal=1";
/** Where the "this browser is ours" flag persists, once seen. */
const BEACON_INTERNAL_KEY = "__lb_internal";

/**
 * The inline script, as source.
 *
 * Sends at most once per page view, on the first `visibilitychange` to hidden
 * (or pagehide) — the only moments a browser reliably still runs code on the
 * way out. `sendBeacon` is used because a normal fetch is cancelled when the
 * page goes away, which is exactly when this fires.
 *
 * Before any of that, it decides whether this visit should count at all: not
 * automation, not us (see the header). Both checks fail OPEN — anything unclear
 * still counts — because over-counting a reader is the worse error.
 */
export function beaconScript(): string {
	const referrers = JSON.stringify(REFERRERS);
	return `(function(){
try{
  // Automation that runs JS (headless Chrome / Playwright / Puppeteer) sets
  // this. It fetched the page like a crawler, not read it like a person — the
  // proxy already counted the request; do not also mint a "confirmed visit".
  if(navigator.webdriver) return;
  // Our own review browsing. The Fleet app tags its "open live site" links with
  // the marker; the first such visit persists a flag, and every visit from a
  // flagged browser is skipped thereafter. Storage can throw (private mode) —
  // then we simply can't tell, and counting is the safe default.
  try{
    if(location.href.indexOf(${JSON.stringify(BEACON_INTERNAL_MARKER)})!==-1) localStorage.setItem(${JSON.stringify(BEACON_INTERNAL_KEY)},'1');
    if(localStorage.getItem(${JSON.stringify(BEACON_INTERNAL_KEY)})==='1') return;
  }catch(e){}

  var sent=false, start=Date.now(), hidden=0, hiddenAt=0, maxScroll=0;

  function depth(){
    var doc=document.documentElement, body=document.body;
    var height=Math.max(doc.scrollHeight, body?body.scrollHeight:0);
    var seen=(window.scrollY||doc.scrollTop||0)+window.innerHeight;
    if(height<=window.innerHeight) return 100; // nothing to scroll: fully seen
    return Math.max(0, Math.min(100, Math.round((seen/height)*100)));
  }

  // Time the page was actually VISIBLE. A tab left in the background for an
  // hour is not an hour of reading, and counting it would quietly inflate
  // every average toward whoever abandoned the most tabs.
  function visibleSeconds(){
    var total=Date.now()-start-hidden;
    if(document.visibilityState==='hidden'&&hiddenAt) total-=(Date.now()-hiddenAt);
    return Math.max(0, Math.min(${MAX_SECONDS}, Math.round(total/1000)));
  }

  function cameFrom(){
    var ref=document.referrer||'';
    if(!ref) return '';
    var host='';
    try{ host=new URL(ref).hostname.toLowerCase(); }catch(e){ return ''; }
    var table=${referrers};
    for(var i=0;i<table.length;i++){
      if(host===table[i][0]||host.endsWith('.'+table[i][0])) return table[i][1];
    }
    return '';
  }

  function send(){
    if(sent) return; sent=true;
    var body=JSON.stringify({
      path: location.pathname,
      seconds: visibleSeconds(),
      scroll: maxScroll,
      from: cameFrom()
    });
    // sendBeacon survives the page going away; fetch does not.
    if(navigator.sendBeacon){ navigator.sendBeacon(${JSON.stringify(BEACON_PATH)}, new Blob([body],{type:'application/json'})); }
  }

  addEventListener('scroll', function(){ var d=depth(); if(d>maxScroll) maxScroll=d; }, {passive:true});
  addEventListener('visibilitychange', function(){
    if(document.visibilityState==='hidden'){ hiddenAt=Date.now(); send(); }
    else if(hiddenAt){ hidden+=Date.now()-hiddenAt; hiddenAt=0; }
  });
  // Safari on iOS often skips visibilitychange on navigation away.
  addEventListener('pagehide', send);
  maxScroll=depth();
}catch(e){/* telemetry must never break a page */}
})();`;
}

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
 * territory, and it is a constraint rather than an oversight.
 *
 * WHO IT REFUSES TO COUNT. The proxy already counts every REQUEST; this beacon
 * exists only to confirm a REAL BROWSER rendered the page. So it declines to
 * fire for automation (`navigator.webdriver` — Playwright / Puppeteer /
 * headless Chrome set it), which executes JS and would otherwise mint a phantom
 * "confirmed visit" indistinguishable from a person.
 * It is conservative: when in doubt it still counts. A missed real reader is a
 * smaller lie than a fabricated one.
 *
 * (It used to also skip "our own" QA browsing via a `?lb_internal=1` URL marker
 * and a localStorage flag. That was removed: the marker rode along in links we
 * sent to clients, and any client who opened one got their own browser flagged
 * internal — silently undercounting their real traffic. Counting everyone,
 * including us, was judged the smaller and more predictable error.)
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

/**
 * The inline script, as source.
 *
 * Sends at most once per page view, on the first `visibilitychange` to hidden
 * (or pagehide) — the only moments a browser reliably still runs code on the
 * way out. `sendBeacon` is used because a normal fetch is cancelled when the
 * page goes away, which is exactly when this fires.
 *
 * Before any of that, it decides whether this visit should count at all: not
 * automation (see the header). The check fails OPEN — anything unclear still
 * counts — because over-counting a reader is the worse error.
 */
export function beaconScript(): string {
	const referrers = JSON.stringify(REFERRERS);
	return `(function(){
try{
  // Automation that runs JS (headless Chrome / Playwright / Puppeteer) sets
  // this. It fetched the page like a crawler, not read it like a person — the
  // proxy already counted the request; do not also mint a "confirmed visit".
  if(navigator.webdriver) return;

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

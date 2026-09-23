import { paletteColorVars } from "@/themes/css";
import type { Theme } from "@/themes/types";

/** localStorage key the reader dark/light preference is persisted under. */
export const MODE_STORAGE_KEY = "ls-color-mode";

/**
 * Inline boot script for the reader dark/light toggle. It runs in <head> before
 * first paint, so the saved preference is applied with no flash of the wrong
 * palette. It exposes `window.__applyMode(mode)` for the toggle button to call,
 * swapping the color custom properties via the CSSOM (fonts/spacing are shared).
 *
 * Returns null when the theme has no alternate palette / hasn't opted in.
 */
export function modeBootScript(theme: Theme): string | null {
  if (!theme.colorsLight || !theme.features?.modeToggle) return null;
  const base = theme.colorScheme === "light" ? "light" : "dark";
  const dark = base === "dark" ? theme.colors : theme.colorsLight;
  const light = base === "dark" ? theme.colorsLight : theme.colors;
  const D = JSON.stringify(paletteColorVars(dark));
  const L = JSON.stringify(paletteColorVars(light));
  return `(function(){var P={dark:${D},light:${L}};window.__PALETTES=P;window.__applyMode=function(m){var p=P[m];if(!p)return;var s=document.documentElement.style;for(var k in p)s.setProperty(k,p[k]);s.setProperty('color-scheme',m==='light'?'light':'dark');document.documentElement.setAttribute('data-mode',m);try{localStorage.setItem('${MODE_STORAGE_KEY}',m);}catch(e){}try{window.dispatchEvent(new CustomEvent('ls-modechange',{detail:m}));}catch(e){}};var m='dark';try{m=localStorage.getItem('${MODE_STORAGE_KEY}')||'dark';}catch(e){}if(m==='light'){window.__applyMode('light');}else{document.documentElement.setAttribute('data-mode','dark');}})();`;
}

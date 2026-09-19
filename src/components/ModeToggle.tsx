"use client";

import { useEffect, useState } from "react";

/**
 * Reader dark/light toggle. The palette swap + persistence live in the inline
 * boot script (see `modeBootScript`), which exposes `window.__applyMode`; this
 * button just calls it and mirrors the current mode in its icon. Rendering it
 * without the boot script (a theme without `colorsLight`) is a harmless no-op.
 */
export function ModeToggle({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const current =
      (document.documentElement.getAttribute("data-mode") as
        | "dark"
        | "light"
        | null) ?? "dark";
    setMode(current);
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<"dark" | "light">).detail;
      if (detail) setMode(detail);
    };
    window.addEventListener("ls-modechange", onChange);
    return () => window.removeEventListener("ls-modechange", onChange);
  }, []);

  const toggle = () => {
    const next = mode === "dark" ? "light" : "dark";
    (window as unknown as { __applyMode?: (m: string) => void }).__applyMode?.(
      next,
    );
    setMode(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-heading ${className}`}
    >
      {mode === "dark" ? (
        // Moon — currently dark.
        <svg
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      ) : (
        // Sun — currently light.
        <svg
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  );
}

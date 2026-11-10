import { useState, useEffect } from "react";

// ─── useMediaQuery ───────────────────────────────────────────────────────────
// Single source of truth for breakpoints. Subscribes to matchMedia change
// events so rotation / resize re-render correctly.
export function useMediaQuery(query) {
  const getMatch = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : false;
  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

// ─── useBodyScrollLock ───────────────────────────────────────────────────────
// Locks background scroll while a sheet/modal is mounted. Ref-counted so nested
// overlays don't unlock prematurely.
let scrollLockCount = 0;
let savedOverflow = "";
export function useBodyScrollLock(active = true) {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    if (scrollLockCount === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    scrollLockCount += 1;
    return () => {
      scrollLockCount -= 1;
      if (scrollLockCount === 0) {
        document.body.style.overflow = savedOverflow;
      }
    };
  }, [active]);
}

// ─── usePrefersReducedMotion ─────────────────────────────────────────────────
export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

// ─── useEscape ───────────────────────────────────────────────────────────────
export function useEscape(onEscape) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onEscape(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onEscape]);
}

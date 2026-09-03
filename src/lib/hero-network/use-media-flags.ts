"use client";

import { useEffect, useState } from "react";

/** Defaults to false on the server/first paint, then corrects on mount — a brief false-negative here just means one calm frame before the (already-restrained) motion kicks in. */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Below this width the pinned scroll-scrub camera journey is disabled in favor of a calmer, non-hijacking scroll. */
export function useIsCompactViewport(): boolean {
  return useMediaQuery("(max-width: 900px)");
}

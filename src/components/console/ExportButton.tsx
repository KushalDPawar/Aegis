"use client";

import { useCallback, useState } from "react";

/**
 * Exports the current view as JSON.
 *
 * Built as a Blob download rather than a server route because the rows are
 * already on the page — round-tripping them to the server to get the same
 * bytes back would add a failure mode for nothing.
 */
export function ExportButton({ filename, rows }: { filename: string; rows: unknown[] }) {
  const [done, setDone] = useState(false);

  const download = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      source: "Aegis operations console — simulation data only",
      count: rows.length,
      rows,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setDone(true);
    window.setTimeout(() => setDone(false), 2200);
  }, [filename, rows]);

  return (
    <button
      onClick={download}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs text-cream-100/80 hover:border-signal-teal/50 hover:text-cream-100 transition-colors"
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 2v8M4.5 6.5L8 10l3.5-3.5M2.5 13h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {done ? "Exported" : `Export ${rows.length} rows`}
    </button>
  );
}

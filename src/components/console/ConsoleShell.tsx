"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/layout/LogoutButton";

const NAV = [
  { href: "/console", label: "Fraud Intelligence", hint: "Live risk & cases" },
  { href: "/console/health", label: "Financial Health", hint: "Resilience predictor" },
  { href: "/console/ai", label: "Intelligence Centre", hint: "How Aegis decides" },
];

/**
 * Console chrome.
 *
 * Three sections, and nothing else in the navigation. Infrastructure surfaces
 * — key management, webhook plumbing, engine health — were removed rather than
 * demoted: they compete for attention with the three things this console
 * exists to show, and none of them is what a reviewer is here to read.
 */
export function ConsoleShell({
  operatorName,
  alertCount,
  children,
}: {
  operatorName: string;
  alertCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  // Route change should never leave a panel hanging open.
  useEffect(() => {
    setNavOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen flex bg-ink-950">
      {/* ---------------- Sidebar ---------------- */}
      <aside
        className={`${navOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 border-r border-white/8 bg-ink-950/95 backdrop-blur-xl transition-transform duration-300 flex flex-col`}
      >
        <div className="px-6 py-6 border-b border-white/8">
          <Link href="/" className="font-display text-lg font-semibold text-cream-100 tracking-tight">
            Aegis
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal-teal/70 mt-1">
            Operations Console
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const active = item.href === "/console" ? pathname === "/console" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`group block rounded-xl px-3 py-2.5 transition-colors duration-200 ${
                      active ? "bg-signal-teal/10 border border-signal-teal/25" : "border border-transparent hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className={`block text-sm ${active ? "text-cream-100 font-medium" : "text-cream-100/70 group-hover:text-cream-100"}`}>
                      {item.label}
                    </span>
                    <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-cream-100/35 mt-0.5">
                      {item.hint}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 py-4 border-t border-white/8">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream-100/35">
            Simulation only — no real accounts
          </p>
        </div>
      </aside>

      {navOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-30 bg-ink-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ---------------- Main column ---------------- */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 border-b border-white/8 bg-ink-950/85 backdrop-blur-xl">
          <div className="flex items-center gap-4 px-4 lg:px-8 py-3.5">
            <button
              onClick={() => setNavOpen((v) => !v)}
              className="lg:hidden rounded-lg border border-white/12 p-2 text-cream-100/70 hover:text-cream-100"
              aria-label="Toggle navigation"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className="flex-1" />

            {/* Notifications */}
            <Link
              href="/console"
              className="relative rounded-lg border border-white/12 bg-white/[0.04] p-2 text-cream-100/70 hover:text-cream-100 hover:border-white/25 transition-colors"
              aria-label={`${alertCount} open cases`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 2a4 4 0 00-4 4v2.5L2.8 11h10.4L12 8.5V6a4 4 0 00-4-4zM6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal-coral px-1 text-[10px] font-semibold text-ink-950">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.04] pl-1 pr-3 py-1 hover:border-white/25 transition-colors"
              aria-label="Open profile"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-signal-teal/20 text-[11px] font-semibold text-signal-teal">
                {operatorName.slice(0, 1)}
              </span>
              <span className="hidden sm:inline text-xs text-cream-100/80">{operatorName}</span>
            </button>
          </div>

        </header>

        <main id="main-content" className="flex-1 px-4 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>

      {/* ---------------- Profile drawer ---------------- */}
      {profileOpen && (
        <>
          <button
            aria-label="Close profile"
            onClick={() => setProfileOpen(false)}
            className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm"
          />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-sm border-l border-white/10 bg-ink-900 p-6 drawer-in overflow-y-auto scrollbar-thin">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal-teal/70">Operator</p>
                <h2 className="font-display text-xl font-semibold text-cream-100 mt-1">{operatorName}</h2>
                <p className="text-xs text-cream-100/50 mt-1">Bank operations · BANK_OPS</p>
              </div>
              <button
                onClick={() => setProfileOpen(false)}
                className="rounded-lg border border-white/12 p-1.5 text-cream-100/60 hover:text-cream-100"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <dl className="mt-8 space-y-4">
              <div className="glass-panel rounded-xl p-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream-100/40">Open cases</dt>
                <dd className="text-sm text-cream-100 mt-1">{alertCount}</dd>
              </div>
              <div className="glass-panel rounded-xl p-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream-100/40">Scope</dt>
                <dd className="text-sm text-cream-100/70 mt-1 leading-relaxed">
                  Estate-wide read access across every simulated customer. No real banking core is connected.
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <LogoutButton />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

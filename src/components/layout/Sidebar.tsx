"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export const NAV_ITEMS = [
  { href: "/incidents",    label: "Fraud Intelligence",   hint: "LIVE RISK & CASES" },
  { href: "/recovery",     label: "Financial Health",     hint: "RESILIENCE PREDICTOR" },
  { href: "/intelligence", label: "Intelligence Centre",  hint: "HOW AEGIS DECIDES" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden lg:flex flex-col w-56 shrink-0 border-r border-white/8 px-4 py-6 bg-ink-950">
      {/* Brand / header */}
      <Link href="/intelligence" className="flex flex-col px-3 mb-8 gap-0.5 group">
        <span className="font-display text-lg font-semibold tracking-tight text-cream-100 group-hover:text-signal-teal transition-colors">
          Aegis
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream-100/35">
          Operations Console
        </span>
      </Link>

      <ul className="space-y-0.5 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (pathname || "").startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex flex-col rounded-xl px-3 py-2.5 transition-colors relative",
                  active
                    ? "bg-signal-teal/10 text-cream-100"
                    : "text-cream-100/55 hover:bg-white/5 hover:text-cream-100"
                )}
              >
                {active && (
                  <span
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-signal-teal"
                    aria-hidden="true"
                  />
                )}
                <span className="text-sm font-medium">{item.label}</span>
                <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-cream-100/35 mt-0.5">
                  {item.hint}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="px-3 text-[10px] text-cream-100/25 leading-relaxed font-mono uppercase tracking-wide">
        Simulation Only — No Real
        <br />
        Accounts
      </p>
    </nav>
  );
}

export function ShieldMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5L4 5.5V11c0 5.2 3.4 9.7 8 10.9 4.6-1.2 8-5.7 8-10.9V5.5L12 2.5Z"
        stroke="#5eead4"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8.5 12.2l2.4 2.4 4.6-4.9" stroke="#5eead4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

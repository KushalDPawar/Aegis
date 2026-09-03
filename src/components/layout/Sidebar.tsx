"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Aegis Core", hint: "Command center" },
  { href: "/intelligence", label: "Intelligence Centre", hint: "How Aegis decides" },
  { href: "/pay", label: "New Payment", hint: "Send money" },
  { href: "/incidents", label: "Incidents", hint: "Scam DNA & Replay" },
  { href: "/trusted-circle", label: "Trusted Circle", hint: "Family & contacts" },
  { href: "/recovery", label: "Recovery Center", hint: "Continuity & navigator" },
  { href: "/impact", label: "Impact", hint: "Protection metrics" },
  { href: "/lab", label: "Scenario Lab", hint: "Run a demo" },
  { href: "/status", label: "System Status", hint: "Security & AI" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden lg:flex flex-col w-64 shrink-0 border-r border-white/8 px-4 py-6">
      <Link href="/dashboard" className="flex items-center gap-2 px-3 mb-8 group">
        <ShieldMark />
        <span className="font-display text-lg font-semibold tracking-tight text-cream-100">Aegis</span>
      </Link>
      <ul className="space-y-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex flex-col rounded-xl px-3 py-2.5 transition-colors relative",
                  active ? "bg-signal-teal/10 text-cream-100" : "text-cream-100/55 hover:bg-white/5 hover:text-cream-100"
                )}
              >
                {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-signal-teal" aria-hidden="true" />}
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-[11px] text-cream-100/40">{item.hint}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="px-3 text-[11px] text-cream-100/30 leading-relaxed font-mono">
        SIMULATION ENVIRONMENT
        <br />
        No real accounts connected.
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

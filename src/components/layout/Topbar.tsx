import Link from "next/link";
import { formatINR } from "@/lib/format";
import { LogoutButton } from "./LogoutButton";
import { MobileNav } from "./MobileNav";

export function Topbar({
  fullName,
  balance,
  accountStatus,
}: {
  fullName: string;
  balance: number;
  accountStatus: string;
}) {
  // Initials for avatar circle
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statusDot =
    accountStatus === "ACTIVE"
      ? "bg-signal-jade"
      : accountStatus === "PROTECTED"
      ? "bg-signal-amber"
      : "bg-signal-crimson";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/8 bg-ink-950/90 backdrop-blur-xl px-4 lg:px-8 h-16">
      {/* Mobile brand mark */}
      <div className="flex items-center gap-3 lg:hidden">
        <Link href="/intelligence" className="flex flex-col">
          <span className="font-display text-base font-semibold text-cream-100">Aegis</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-cream-100/35">Operations Console</span>
        </Link>
      </div>

      {/* Desktop: account status pill */}
      <div className="hidden lg:flex items-center gap-2">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDot}`} aria-hidden="true" />
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-cream-100/45">
          {accountStatus === "ACTIVE" ? "System Active" : accountStatus === "PROTECTED" ? "Protected Mode" : "Restricted"}
        </span>
      </div>

      {/* Right side: notifications + user */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          aria-label="Notifications"
          className="relative rounded-xl border border-white/10 p-2 text-cream-100/55 hover:text-cream-100 hover:border-white/20 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* Unread dot */}
          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-signal-crimson text-[9px] font-mono font-semibold text-white flex items-center justify-center px-0.5" aria-label="2 unread notifications">
            2
          </span>
        </button>

        {/* User avatar + name */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-signal-teal/20 border border-signal-teal/30 flex items-center justify-center shrink-0">
            <span className="font-mono text-xs font-semibold text-signal-teal">{initials}</span>
          </div>
          <span className="hidden sm:block text-sm font-medium text-cream-100">{fullName}</span>
        </div>

        <div className="hidden sm:block">
          <LogoutButton />
        </div>
        <MobileNav />
      </div>
    </header>
  );
}

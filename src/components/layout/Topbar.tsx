import Link from "next/link";
import { formatINR } from "@/lib/format";
import { LogoutButton } from "./LogoutButton";
import { MobileNav } from "./MobileNav";
import { ShieldMark } from "./Sidebar";

export function Topbar({
  fullName,
  balance,
  accountStatus,
}: {
  fullName: string;
  balance: number;
  accountStatus: string;
}) {
  const statusMeta =
    accountStatus === "PROTECTED"
      ? { label: "Protected Account", className: "text-signal-amber bg-signal-amber/10 border-signal-amber/30" }
      : accountStatus === "RESTRICTED"
        ? { label: "Restricted", className: "text-signal-crimson bg-signal-crimson/10 border-signal-crimson/30" }
        : { label: "Active", className: "text-signal-jade bg-signal-jade/10 border-signal-jade/30" };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/8 bg-ink-950/80 backdrop-blur-xl px-4 lg:px-8 h-16">
      <div className="flex items-center gap-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ShieldMark />
        </Link>
      </div>
      <div className="hidden lg:flex items-center gap-3">
        <span className={`rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wide ${statusMeta.className}`}>
          {statusMeta.label}
        </span>
      </div>
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-cream-100 leading-tight">{fullName}</p>
          <p className="font-mono text-xs text-cream-100/45 leading-tight">{formatINR(balance)}</p>
        </div>
        <LogoutButton />
        <MobileNav />
      </div>
    </header>
  );
}

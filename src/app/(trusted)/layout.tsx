import Link from "next/link";
import { requireTrustedContact } from "@/lib/auth/guard";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { ShieldMark } from "@/components/layout/Sidebar";

export default async function TrustedLayout({ children }: { children: React.ReactNode }) {
  await requireTrustedContact();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/8 bg-ink-950/80 backdrop-blur-xl px-6 h-16">
        <Link href="/trusted/dashboard" className="flex items-center gap-2">
          <ShieldMark />
          <span className="font-display text-lg font-semibold text-cream-100">Aegis</span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-cream-100/40 ml-2 border border-white/12 rounded-full px-2 py-0.5">
            Trusted Contact Portal
          </span>
        </Link>
        <LogoutButton />
      </header>
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

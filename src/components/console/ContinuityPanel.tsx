"use client";

import { useState } from "react";
import { Panel, Money, EmptyState } from "./primitives";

interface ContinuityAccount {
  accountId: string;
  customerName: string;
  balance: number;
  beneficiaries: { id: string; name: string; relationship: string; trustScore: number; essential: boolean }[];
}

/**
 * Financial Continuity Mode.
 *
 * The list is split rather than filtered because the point of the feature is
 * the contrast: an operator needs to see, in one glance, exactly what a
 * protected customer can still pay — otherwise "protection" is indistinguishable
 * from a freeze, which is the failure this product exists to avoid.
 */
export function ContinuityPanel({ accounts }: { accounts: ContinuityAccount[] }) {
  const [openId, setOpenId] = useState<string | null>(accounts[0]?.accountId ?? null);

  return (
    <Panel eyebrow="Financial continuity" title="Accounts under protection">
      {accounts.length === 0 ? (
        <EmptyState
          title="No accounts in protected mode"
          hint="When an account is protected, its essential payees stay reachable and everything else holds for review."
        />
      ) : (
        <ul className="space-y-3">
          {accounts.map((a) => {
            const open = openId === a.accountId;
            const essential = a.beneficiaries.filter((b) => b.essential);
            const held = a.beneficiaries.filter((b) => !b.essential);
            return (
              <li key={a.accountId} className="rounded-xl border border-white/8 overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : a.accountId)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left hover:bg-white/[0.03] transition-colors"
                >
                  <div>
                    <p className="text-sm text-cream-100">{a.customerName}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-cream-100/40 mt-0.5">
                      {essential.length} payable · {held.length} held · balance <Money value={a.balance} />
                    </p>
                  </div>
                  <svg
                    width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                    className={`shrink-0 text-cream-100/40 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {open && (
                  <div className="value-in grid gap-4 sm:grid-cols-2 border-t border-white/8 px-4 py-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-signal-jade mb-2">
                        Still payable — essential
                      </p>
                      {essential.length === 0 ? (
                        <p className="text-xs text-cream-100/40">None.</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {essential.map((b) => (
                            <li key={b.id} className="flex items-center justify-between gap-3 text-xs">
                              <span className="text-cream-100/80 truncate">{b.name}</span>
                              <span className="font-mono text-[10px] text-cream-100/35 shrink-0">
                                {b.relationship} · {b.trustScore}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-signal-amber mb-2">
                        Held for review
                      </p>
                      {held.length === 0 ? (
                        <p className="text-xs text-cream-100/40">None.</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {held.map((b) => (
                            <li key={b.id} className="flex items-center justify-between gap-3 text-xs">
                              <span className="text-cream-100/70 truncate">{b.name}</span>
                              <span className="font-mono text-[10px] text-cream-100/35 shrink-0">
                                {b.relationship} · {b.trustScore}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-xs text-cream-100/40 mt-4 leading-relaxed">
        A payee stays reachable when they are established, not flagged, and trusted at 60 or above — the same predicate
        GUARD applies at runtime.
      </p>
    </Panel>
  );
}

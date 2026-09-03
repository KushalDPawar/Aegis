"use client";

import { useState } from "react";
import { buildNavigatorResponse, NAVIGATOR_OPTIONS, type NavigatorTopic } from "@/lib/recovery-navigator";
import type { ScamCategory } from "@/lib/ai/schema";

export function RecoveryNavigator(props: {
  hasCase: boolean;
  accountStatus: string;
  incidentTitle?: string;
  scamCategory?: ScamCategory | null;
  amountAtRisk?: number;
  amountProtected?: number;
  recoveryStatus?: string;
  createdAtIso?: string;
}) {
  const [response, setResponse] = useState<string | null>(
    "Your account was placed under protective restriction after a suspected impersonation scam. I can explain what happened and guide you through the available recovery steps."
  );

  function ask(topic: NavigatorTopic) {
    setResponse(
      buildNavigatorResponse(topic, {
        hasCase: props.hasCase,
        accountStatus: props.accountStatus,
        incidentTitle: props.incidentTitle,
        scamCategory: props.scamCategory,
        amountAtRisk: props.amountAtRisk,
        amountProtected: props.amountProtected,
        recoveryStatus: props.recoveryStatus,
        createdAt: props.createdAtIso ? new Date(props.createdAtIso) : undefined,
      })
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 text-sm text-cream-100/80 leading-relaxed" aria-live="polite">
        {response}
      </div>
      <div className="flex flex-wrap gap-2">
        {NAVIGATOR_OPTIONS.map((opt) => (
          <button
            key={opt.topic}
            onClick={() => ask(opt.topic)}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-cream-100/80 hover:border-signal-teal/50 hover:text-cream-100 transition-colors"
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-cream-100/35 font-mono uppercase tracking-wider">Simulated guided workflow — not real legal or banking advice.</p>
    </div>
  );
}

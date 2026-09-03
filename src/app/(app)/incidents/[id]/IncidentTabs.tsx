"use client";

import { useState } from "react";
import Link from "next/link";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Timeline, type TimelineItem } from "@/components/ui/Timeline";
import { SignalList } from "@/components/risk/SignalList";
import { ScoreBar } from "@/components/risk/ScoreBar";
import { ConfidenceTag } from "@/components/ui/Badge";
import { formatINR } from "@/lib/format";
import type { IncidentDetail } from "@/lib/queries/incidents";

const TABS = ["Overview", "Scam DNA", "Replay"] as const;
type Tab = (typeof TABS)[number];

export function IncidentTabs({ incident }: { incident: IncidentDetail }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const latestAssessment = incident.transaction?.riskAssessments[0];

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Incident views" className="flex gap-2 border-b border-white/8 rise" style={{ animationDelay: "100ms" }}>
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? "border-signal-teal text-cream-100" : "border-transparent text-cream-100/50 hover:text-cream-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-5 rise" style={{ animationDelay: "140ms" }}>
          <Panel>
            <PanelHeader eyebrow="Scam Pattern" title={incident.scamPattern?.name ?? "Unclassified pattern"} />
            {incident.scamPattern && (
              <dl className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-cream-100/40 mb-1">Attack vector</dt>
                  <dd className="text-cream-100/80">{incident.scamPattern.vector}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-cream-100/40 mb-1">Psychology</dt>
                  <dd className="text-cream-100/80">{incident.scamPattern.psychology}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-cream-100/40 mb-1">Description</dt>
                  <dd className="text-cream-100/80">{incident.scamPattern.description}</dd>
                </div>
              </dl>
            )}
          </Panel>
          {incident.recoveryCase && (
            <Panel>
              <PanelHeader
                eyebrow="Recovery"
                title="This incident opened a recovery case"
                action={
                  <Link href="/recovery" className="text-signal-teal text-sm hover:underline">
                    Open Recovery Center →
                  </Link>
                }
              />
              <p className="text-sm text-cream-100/60">
                Status: <span className="text-cream-100">{incident.recoveryCase.status}</span> · Amount protected:{" "}
                <span className="text-signal-jade">{formatINR(incident.recoveryCase.amountProtected)}</span>
              </p>
            </Panel>
          )}
          {incident.transaction && (
            <Panel>
              <PanelHeader
                eyebrow="Transaction"
                title={`${formatINR(incident.transaction.amount)} to ${incident.transaction.beneficiary.name}`}
                action={
                  <Link href={`/pay/${incident.transaction.id}/trace`} className="text-signal-teal text-sm hover:underline">
                    View TRACE →
                  </Link>
                }
              />
              <p className="text-sm text-cream-100/55">{incident.transaction.purpose}</p>
            </Panel>
          )}
        </div>
      )}

      {tab === "Scam DNA" && (
        <div className="rise" style={{ animationDelay: "140ms" }}>
          <Panel className="relative overflow-hidden">
            <div className="absolute inset-0 risk-grid-bg opacity-[0.04] pointer-events-none" aria-hidden="true" />
            <div className="relative space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-crimson">Scam Fingerprint</p>
                <span className="font-mono text-sm text-cream-100/70 border border-white/15 rounded-full px-3 py-1">
                  {incident.signature}
                </span>
              </div>
              <DnaField label="Scam Type" value={incident.scamPattern?.name ?? "Unclassified"} />
              <DnaField label="Attack Vector" value={incident.scamPattern?.vector ?? "—"} />
              <DnaField label="Psychology" value={incident.scamPattern?.psychology ?? "—"} />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-cream-100/40 mb-2">Behavioral Signals</p>
                {latestAssessment ? (
                  <SignalList signals={latestAssessment.signals.filter((s) => s.category !== "TRANSACTION")} />
                ) : (
                  <p className="text-sm text-cream-100/45">No signals recorded.</p>
                )}
              </div>
              <DnaField label="Context" value={incident.scamPattern?.description ?? "—"} />
            </div>
          </Panel>
        </div>
      )}

      {tab === "Replay" && (
        <div className="space-y-5 rise" style={{ animationDelay: "140ms" }}>
          {latestAssessment && (
            <Panel>
              <PanelHeader eyebrow="Decision Integrity" title="Final risk breakdown" />
              <div className="space-y-4">
                <ScoreBar label="Transaction Risk" score={latestAssessment.transactionRisk} />
                <ScoreBar label="Beneficiary Risk" score={latestAssessment.beneficiaryRisk} />
                <ScoreBar label="Behavioral Risk" score={latestAssessment.behavioralRisk} />
                <ScoreBar label="Context Risk" score={latestAssessment.contextRisk} />
                <ScoreBar label="Social Engineering Risk" score={latestAssessment.socialEngineeringRisk} />
                <ScoreBar label="Decision Integrity" score={latestAssessment.decisionIntegrity} invert />
              </div>
            </Panel>
          )}

          {incident.transaction && incident.transaction.intentChecks.length > 0 && (
            <Panel>
              <PanelHeader eyebrow="MIND" title="AI Intent Check findings" />
              <ul className="space-y-4">
                {incident.transaction.intentChecks.map((c) => (
                  <li key={c.id} className="border border-white/8 rounded-xl p-4 bg-white/[0.02]">
                    <p className="text-sm text-cream-100/50 mb-1">{c.question}</p>
                    <p className="text-sm text-cream-100 mb-2">&ldquo;{c.response}&rdquo;</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <ConfidenceTag confidence={c.source === "AI" ? "CONFIRMED" : "INFERRED"} />
                      <span className="font-mono text-[11px] text-cream-100/45">
                        source: {c.source} · confidence {Math.round(c.confidence * 100)}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel>
            <PanelHeader eyebrow="Timeline" title="Reconstructed sequence" />
            <Timeline items={buildReplayTimeline(incident)} />
          </Panel>

          {incident.interventions.length > 0 && (
            <Panel>
              <PanelHeader eyebrow="Interventions" title="Actions taken" />
              <ul className="space-y-3">
                {incident.interventions.map((i) => (
                  <li key={i.id} className="text-sm">
                    <span className="font-mono text-signal-teal">{i.action}</span> — {i.explanation}
                    {i.customerChoice && <span className="text-cream-100/45"> · customer chose: {i.customerChoice}</span>}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}

function DnaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wider text-cream-100/40 mb-1">{label}</p>
      <p className="text-cream-100 text-[15px]">{value}</p>
    </div>
  );
}

function buildReplayTimeline(incident: IncidentDetail): TimelineItem[] {
  const items: TimelineItem[] = [];
  if (incident.transaction) {
    for (const e of incident.transaction.events) {
      let severity = 0;
      if (e.metadata) {
        try {
          severity = JSON.parse(e.metadata).severity ?? 0;
        } catch {
          severity = 0;
        }
      }
      items.push({ id: e.id, timestamp: e.createdAt, label: e.label, description: e.description, severity, tag: e.type.replace(/_/g, " ") });
    }
  }
  for (const e of incident.events) {
    items.push({ id: e.id, timestamp: e.timestamp, label: e.label, description: e.description, severity: e.severity, tag: e.sourceType });
  }
  return items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

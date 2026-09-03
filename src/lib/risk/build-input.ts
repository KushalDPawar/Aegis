import type { Account, Beneficiary, Profile } from "@prisma/client";
import type { BeneficiarySignals, ContextSignals, TransactionSignals } from "./types";
import type { VulnerabilityProfile } from "@/lib/enums";

export function buildTransactionSignals(params: {
  amount: number;
  account: Pick<Account, "avgTxnAmount">;
  transactionsLast24h: number;
  forceUnusualTime?: boolean;
}): TransactionSignals {
  const hour = new Date().getHours();
  const naturallyUnusual = hour >= 23 || hour < 5;
  return {
    amount: params.amount,
    avgHistoricalAmount: params.account.avgTxnAmount,
    transactionsLast24h: params.transactionsLast24h,
    unusualTime: params.forceUnusualTime ?? naturallyUnusual,
  };
}

export function buildBeneficiarySignals(beneficiary: Beneficiary): BeneficiarySignals {
  const ageMs = Date.now() - new Date(beneficiary.createdAt).getTime();
  const accountAgeDays = ageMs / (1000 * 60 * 60 * 24);
  return {
    isFirstTime: beneficiary.isFirstTime,
    trustScore: beneficiary.trustScore,
    historicalTransactionCount: 0,
    suspiciousFlag: beneficiary.suspiciousFlag,
    accountAgeDays,
  };
}

export function buildContextSignals(params: {
  profile: Pick<Profile, "vulnerabilityProfile">;
  urgencyIndicator?: boolean;
  suspiciousCallReported?: boolean;
  knownScamPatternCode?: string | null;
  activeScamSimulation?: boolean;
}): ContextSignals {
  return {
    activeScamSimulation: params.activeScamSimulation ?? false,
    urgencyIndicator: params.urgencyIndicator ?? false,
    knownScamPatternCode: params.knownScamPatternCode ?? null,
    vulnerabilityProfile: params.profile.vulnerabilityProfile as VulnerabilityProfile,
    suspiciousCallReported: params.suspiciousCallReported ?? false,
  };
}

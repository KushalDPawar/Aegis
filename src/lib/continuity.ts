export interface EssentialBeneficiaryInput {
  isFirstTime: boolean;
  suspiciousFlag: boolean;
  trustScore: number;
}

/**
 * Financial Continuity Mode rule: while an account is PROTECTED, only
 * established, non-suspicious, sufficiently-trusted beneficiaries remain
 * payable. Everything else pauses for review — but existing essential
 * banking never gets cut off.
 */
export function isBeneficiaryEssential(beneficiary: EssentialBeneficiaryInput): boolean {
  return !beneficiary.isFirstTime && !beneficiary.suspiciousFlag && beneficiary.trustScore >= 60;
}

/**
 * Confirmation of Payee (CoP) & Identity Cross-Referencing Service
 *
 * Implements the inter-bank standard for verifying whether the sender's entered
 * beneficiary name genuinely matches the legal KYC owner registered to that bank account.
 */

import { BankAccountRecord, queryBankingDatabase } from '../data/bankingDatabase';

export type PayeeMatchVerdict =
  | 'VERIFIED'           // Match >= 80% — Legal name matches entered name
  | 'PARTIAL_MATCH'      // Match 45% - 79% — Minor difference or company DBA
  | 'CRITICAL_MISMATCH'  // Match < 45% — Account belongs to a completely different person/entity
  | 'UNREGISTERED';      // Account not found in core banking registry

export interface PayeeVerificationResult {
  verdict: PayeeMatchVerdict;
  matchScore: number;           // 0 to 100
  enteredName: string;
  enteredAccount: string;
  accountRecord: BankAccountRecord | null;
  legalKycName: string;
  bankName: string;
  accountType: string;
  isMuleSuspect: boolean;
  alertHeadline: string;
  alertDetail: string;
  riskPenalty: number;          // Impact on overall risk score
  recommendedAction: string;
}

/**
 * Clean & tokenize a name string for linguistic comparison
 */
function tokenizeName(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(token => token.length > 1 && !['ltd', 'pvt', 'llp', 'co', 'the', 'and', 'inc'].includes(token));
}

/**
 * Calculates Token Similarity & Jaccard Overlap between entered name and legal KYC name
 */
function computeNameSimilarity(entered: string, legal: string): number {
  if (!entered || !legal) return 0;

  const cleanEntered = entered.trim().toLowerCase();
  const cleanLegal   = legal.trim().toLowerCase();

  // Exact string match
  if (cleanEntered === cleanLegal) return 100;
  if (cleanLegal.includes(cleanEntered) || cleanEntered.includes(cleanLegal)) return 90;

  const enteredTokens = tokenizeName(cleanEntered);
  const legalTokens   = tokenizeName(cleanLegal);

  if (enteredTokens.length === 0 || legalTokens.length === 0) return 0;

  // Count matching words
  let matchCount = 0;
  for (const eToken of enteredTokens) {
    if (legalTokens.some(lToken => lToken === eToken || (eToken.length >= 4 && lToken.includes(eToken)))) {
      matchCount++;
    }
  }

  // Jaccard similarity score
  const unionSize = new Set([...enteredTokens, ...legalTokens]).size;
  const jaccard   = unionSize > 0 ? (matchCount / unionSize) : 0;

  return Math.min(100, Math.round(jaccard * 100));
}

/**
 * Cross-checks the entered recipient name against the actual Core Banking Account Registry
 */
export function verifyPayeeCrossCheck(
  enteredName: string,
  enteredAccount: string
): PayeeVerificationResult {
  const accountRecord = queryBankingDatabase(enteredAccount);

  // ── CASE 1: Account NOT Found in Inter-Bank Registry ─────────────────────────
  if (!accountRecord) {
    return {
      verdict: 'UNREGISTERED',
      matchScore: 0,
      enteredName,
      enteredAccount,
      accountRecord: null,
      legalKycName: 'Unregistered / Synthetic Account',
      bankName: 'Unknown Bank Registry',
      accountType: 'Unverified External Account',
      isMuleSuspect: false,
      alertHeadline: 'Account Not in Verified Banking Registry',
      alertDetail: `Account "${enteredAccount}" is not recognized in the inter-bank customer directory. Transfers to unverified or new external accounts carry higher baseline risk.`,
      riskPenalty: 22,
      recommendedAction: 'Verify the account number directly with the recipient through a trusted separate channel before transferring.',
    };
  }

  // ── CASE 2: Account Record Found — Compare Legal KYC Name with Entered Name ──
  const similarity = computeNameSimilarity(enteredName, accountRecord.legalKycName);
  const isMule     = accountRecord.muleStatus === 'Confirmed Syndicate Mule' || accountRecord.muleStatus === 'Suspected Mule';

  // Check if user entered an official/authority word while account is personal savings
  const claimsAuthority = /escrow|clearance|police|court|rbi|cbi|ed|customs|kyc desk|gateway/i.test(enteredName);
  const isPersonalAccount = accountRecord.accountType === 'Personal Savings';

  if (similarity >= 80 && !isMule) {
    // Verified match
    return {
      verdict: 'VERIFIED',
      matchScore: similarity,
      enteredName,
      enteredAccount,
      accountRecord,
      legalKycName: accountRecord.legalKycName,
      bankName: accountRecord.bankName,
      accountType: accountRecord.accountType,
      isMuleSuspect: false,
      alertHeadline: 'Confirmation of Payee: Legal Name Verified ✓',
      alertDetail: `Bank records confirm this account is legally registered to "${accountRecord.legalKycName}" (${accountRecord.accountType}, ${accountRecord.bankName}).`,
      riskPenalty: -25, // Trust bonus
      recommendedAction: 'Proceed normally. Recipient identity matches verified bank KYC records.',
    };
  }

  if (similarity >= 45 && !isMule) {
    // Partial match (e.g. trading name vs legal company name or short name)
    return {
      verdict: 'PARTIAL_MATCH',
      matchScore: similarity,
      enteredName,
      enteredAccount,
      accountRecord,
      legalKycName: accountRecord.legalKycName,
      bankName: accountRecord.bankName,
      accountType: accountRecord.accountType,
      isMuleSuspect: false,
      alertHeadline: 'Partial Name Match on Bank Record',
      alertDetail: `You entered "${enteredName}", but the bank account is registered as "${accountRecord.legalKycName}". Please verify this is the intended entity.`,
      riskPenalty: 5,
      recommendedAction: 'Confirm with the recipient that their official bank account name matches the name you entered.',
    };
  }

  // ── Critical Discrepancy (Entered Name vs Legal Account Owner Mismatch) ──
  const headline = claimsAuthority && isPersonalAccount
    ? '🚨 CRITICAL IMPERSONATION: Claimed Agency vs Personal Mule Account'
    : isMule
    ? '🚨 CONFIRMED MULE ACCOUNT: Identity Discrepancy & Fraud Watchlist Hit'
    : '🚨 SEVERE IDENTITY MISMATCH: Account Belongs to a Different Person';

  let detail = `You entered "${enteredName}", but this bank account legally belongs to "${accountRecord.legalKycName}" (${accountRecord.accountType}, ${accountRecord.bankName}).`;
  if (claimsAuthority && isPersonalAccount) {
    detail += ` Scammers falsely claim funds are going to an official agency escrow, while directing your money into a private individual's personal savings account.`;
  }
  if (isMule) {
    detail += ` ${accountRecord.notes}`;
  }

  return {
    verdict: 'CRITICAL_MISMATCH',
    matchScore: similarity,
    enteredName,
    enteredAccount,
    accountRecord,
    legalKycName: accountRecord.legalKycName,
    bankName: accountRecord.bankName,
    accountType: accountRecord.accountType,
    isMuleSuspect: true,
    alertHeadline: headline,
    alertDetail: detail,
    riskPenalty: isMule ? 55 : 38,
    recommendedAction: 'STOP IMMEDIATELY. Do not transfer funds. Real government agencies, police, and banks never accept payments into private individual bank accounts.',
  };
}

/**
 * Core Banking & Inter-Bank Confirmation of Payee (CoP) Registry Database
 *
 * In real-world banking (NPCI, UK Confirmation of Payee, US FedNow), every bank
 * account is bound to a verified legal KYC identity.
 *
 * When a sender enters a recipient's name and account number:
 * 1. The bank queries the account registry by account number.
 * 2. It compares the sender's entered name against the legal KYC name.
 * 3. Any discrepancy (e.g. entering "Govt Escrow" for an account owned by "Ramesh Patel")
 *    exposes money mule syndicates and impersonation fraud immediately.
 */

export interface BankAccountRecord {
  accountNumber: string;        // Clean account number or VPA handle
  displayAccount: string;       // Formatted representation
  legalKycName: string;         // Verified legal name on the bank account
  bankName: string;             // Bank institution
  branch?: string;              // Branch location
  ifscPrefix?: string;          // IFSC / Routing code prefix
  accountType: 'Personal Savings' | 'Commercial Current' | 'Government Authority' | 'Utility / Merchant';
  kycStatus: 'Verified' | 'Pending' | 'Flagged';
  muleStatus: 'Clean' | 'Suspected Mule' | 'Confirmed Syndicate Mule';
  reportedScamVectors?: string[];
  notes: string;
}

export const BANKING_DATABASE: BankAccountRecord[] = [
  // ── 1. Confirmed Mule Accounts (Used in Impersonation / Digital Arrest Scams) ──
  {
    accountNumber: '30948827110',
    displayAccount: 'SBIN0008821 · 30948827110',
    legalKycName: 'Ramesh Kumar Patel',
    bankName: 'State Bank of India',
    branch: 'Surat Ring Road Branch, Gujarat',
    ifscPrefix: 'SBIN0008821',
    accountType: 'Personal Savings',
    kycStatus: 'Flagged',
    muleStatus: 'Confirmed Syndicate Mule',
    reportedScamVectors: ['Digital Arrest Impersonation', 'Fake Law Enforcement Escrow'],
    notes: 'Account registered to a private individual. Active police FIRs indicate this personal account is rented by cyber syndicates masquerading as "Govt Clearance Escrow" or "CBI Clearance".',
  },
  {
    accountNumber: '9820192841@paytm',
    displayAccount: '9820192841@paytm · paytm0123456',
    legalKycName: 'Vikramjit Singh',
    bankName: 'Paytm Payments Bank',
    branch: 'Noida Sector 62',
    ifscPrefix: 'PYTM0123456',
    accountType: 'Personal Savings',
    kycStatus: 'Flagged',
    muleStatus: 'Confirmed Syndicate Mule',
    reportedScamVectors: ['Fake KYC Phishing', 'PAN Suspension Threat'],
    notes: 'Personal mobile wallet account. Used in phishing SMS campaigns where scammers tell victims they are paying the "NPCI Central KYC Desk".',
  },
  {
    accountNumber: '40291028391',
    displayAccount: 'ICIC0009988 · 40291028391',
    legalKycName: 'Deepak Mohan Lal',
    bankName: 'ICICI Bank',
    branch: 'Dwarka Sector 10, New Delhi',
    ifscPrefix: 'ICIC0009988',
    accountType: 'Personal Savings',
    kycStatus: 'Verified',
    muleStatus: 'Suspected Mule',
    reportedScamVectors: ['High-Value Rapid Layering', 'Unknown Third-Party Transfer'],
    notes: 'New personal savings account opened 14 days ago. Zero commercial billing history; multiple rapid high-value incoming transfers flagged.',
  },

  // ── 2. Verified Legitimate Commercial Vendors & Utility Accounts ──
  {
    accountNumber: '501004928192',
    displayAccount: 'HDFC0001249 · 501004928192',
    legalKycName: 'Arjun Sharma (Chroma Studios LLP)',
    bankName: 'HDFC Bank',
    branch: 'Bandra West, Mumbai',
    ifscPrefix: 'HDFC0001249',
    accountType: 'Commercial Current',
    kycStatus: 'Verified',
    muleStatus: 'Clean',
    notes: 'Verified corporate current account with GSTIN on record. 14 months of consistent billing for freelance design deliverables.',
  },
  {
    accountNumber: 'billdesk-tatapower',
    displayAccount: 'billdesk-tatapower@icici',
    legalKycName: 'Tata Power Company Limited',
    bankName: 'ICICI Bank',
    branch: 'Corporate Banking Branch, Mumbai',
    accountType: 'Utility / Merchant',
    kycStatus: 'Verified',
    muleStatus: 'Clean',
    notes: 'Registered utility provider. Recurring monthly electricity bill collection.',
  },
  {
    accountNumber: 'naturefresh@hdfc',
    displayAccount: 'UPI-MERC · naturefresh@hdfc',
    legalKycName: 'Nature Fresh Organic Foods Pvt Ltd',
    bankName: 'HDFC Bank',
    branch: 'Indiranagar, Bengaluru',
    accountType: 'Commercial Current',
    kycStatus: 'Verified',
    muleStatus: 'Clean',
    notes: 'Verified retail merchant with daily transactional history.',
  },
  {
    accountNumber: '8910283719',
    displayAccount: 'KKBK0000192 · 8910283719',
    legalKycName: 'Urban Cred Flexi-Finance Limited',
    bankName: 'Kotak Mahindra Bank',
    branch: 'Nariman Point, Mumbai',
    ifscPrefix: 'KKBK0000192',
    accountType: 'Commercial Current',
    kycStatus: 'Verified',
    muleStatus: 'Clean',
    notes: 'RBI-registered Non-Banking Financial Company (NBFC). Monthly installment repayments.',
  },
];

/**
 * Normalizes account numbers / VPA handles for reliable lookup.
 * Strips whitespace, IFSC prefixes, and special separator characters.
 */
export function normalizeAccountKey(raw: string): string {
  if (!raw) return '';
  const lower = raw.toLowerCase().trim();
  // If it's a UPI handle (contains @), keep alphanumeric + @
  if (lower.includes('@')) {
    return lower.replace(/[^a-z0-9@.\-_]/g, '');
  }
  // Otherwise extract numeric sequence or primary alphanumeric code
  const digitsOnly = lower.replace(/[^0-9]/g, '');
  if (digitsOnly.length >= 8) {
    return digitsOnly;
  }
  return lower.replace(/[^a-z0-9]/g, '');
}

/**
 * Core Database Query: Looks up account record in bank database.
 */
export function queryBankingDatabase(rawAccount: string): BankAccountRecord | null {
  const normKey = normalizeAccountKey(rawAccount);
  if (!normKey) return null;

  for (const record of BANKING_DATABASE) {
    const recKey = normalizeAccountKey(record.accountNumber);
    const recDisplayKey = normalizeAccountKey(record.displayAccount);

    if (
      recKey === normKey ||
      recDisplayKey.includes(normKey) ||
      normKey.includes(recKey)
    ) {
      return record;
    }
  }

  return null;
}

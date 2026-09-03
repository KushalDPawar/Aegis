/**
 * Inter-bank Confirmation of Payee registry.
 *
 * The single highest-value check in the whole product: scam victims are almost
 * always told the destination is an official escrow, a clearance account, or a
 * government desk. The registry holds the name the account is *legally* KYC'd
 * to, so the mismatch between what the customer was told and who actually owns
 * the account can be shown side by side, before the money moves.
 *
 * Simulation data. No real account is represented here.
 */

export type PaymentRail = "UPI" | "IMPS" | "NEFT" | "RTGS";

export const PAYMENT_RAILS: { id: PaymentRail; label: string }[] = [
  { id: "UPI", label: "UPI — Phone / QR Pay" },
  { id: "IMPS", label: "IMPS — Instant Bank Transfer" },
  { id: "NEFT", label: "NEFT — Standard Bank Transfer" },
  { id: "RTGS", label: "RTGS — High Value (₹2L+)" },
];

export interface RegistryEntry {
  id: string;
  /** The name the account is legally KYC'd to. */
  legalName: string;
  bank: string;
  ifsc: string;
  accountRef: string;
  accountType: string;
  /** Confirmed mule / rented account. */
  knownMule: boolean;
  /** Established payee with a clean history. */
  trusted: boolean;
  intelligence: string;
}

export const COP_REGISTRY: RegistryEntry[] = [
  {
    id: "reg-1",
    legalName: "Ramesh Kumar Patel",
    bank: "State Bank of India",
    ifsc: "SBIN0008821",
    accountRef: "30948827110",
    accountType: "Personal Savings",
    knownMule: true,
    trusted: false,
    intelligence:
      "Account registered to a private individual. Active police FIRs indicate this personal account is rented by cyber syndicates masquerading as “Govt Clearance Escrow” or “CBI Clearance”.",
  },
  {
    id: "reg-2",
    legalName: "Deepak Mohan Lal",
    bank: "ICICI Bank",
    ifsc: "ICIC0009988",
    accountRef: "40291028391",
    accountType: "Personal Savings",
    knownMule: false,
    trusted: false,
    intelligence: "Private individual account with no adverse history and no established relationship to this customer.",
  },
  {
    id: "reg-3",
    legalName: "Arjun Sharma (Chroma Studios LLP)",
    bank: "HDFC Bank",
    ifsc: "HDFC0001249",
    accountRef: "501004928192",
    accountType: "Current — Registered LLP",
    knownMule: false,
    trusted: true,
    intelligence: "Registered business current account. Prior settled invoices from this customer on record.",
  },
  {
    id: "reg-4",
    legalName: "Tata Power Company Limited",
    bank: "ICICI Bank",
    ifsc: "billdesk-tatapower@icici",
    accountRef: "BILLDESK-VERIFIED",
    accountType: "Verified Biller",
    knownMule: false,
    trusted: true,
    intelligence: "Verified utility biller on the national BillDesk registry. Destination cannot be reassigned.",
  },
  {
    id: "reg-5",
    legalName: "Urban Cred Flexi-Finance Limited",
    bank: "Kotak Mahindra Bank",
    ifsc: "KKBK0000192",
    accountRef: "8910283719",
    accountType: "Current — NBFC",
    knownMule: false,
    trusted: false,
    intelligence:
      "Licensed NBFC. Legitimate entity, but frequently impersonated in advance-fee loan scams — confirm the loan reference independently.",
  },
  {
    id: "reg-6",
    legalName: "Vikramjit Singh",
    bank: "Paytm Payments Bank",
    ifsc: "paytm0123456",
    accountRef: "9820192841@paytm",
    accountType: "Wallet — Personal",
    knownMule: true,
    trusted: false,
    intelligence:
      "Wallet opened 11 days ago, already linked to a layered outflow chain. Typical first hop for investment-group payouts.",
  },
  {
    id: "reg-7",
    legalName: "Nature Fresh Organic Foods Pvt Ltd",
    bank: "HDFC Bank",
    ifsc: "UPI-MERC",
    accountRef: "naturefresh@hdfc",
    accountType: "Merchant — Verified",
    knownMule: false,
    trusted: true,
    intelligence: "Verified UPI merchant with a settled transaction history against this customer.",
  },
];

export interface PayeeMatch {
  /** 0-100. A name mismatch on a payment is the strongest single tell. */
  matchPercent: number;
  verdict: "MATCH" | "PARTIAL" | "MISMATCH";
  entry: RegistryEntry;
}

/** Normalizes for comparison: case, punctuation and honorifics all vary. */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(mr|mrs|ms|dr|shri|smt)\b\.?/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Compares the name the customer typed against the account's legal owner.
 *
 * Token overlap rather than string distance: scam scripts substitute an
 * entirely different institutional-sounding phrase ("Govt Clearance Escrow")
 * rather than misspelling a real name, so shared words are the signal that
 * matters.
 */
export function confirmPayee(enteredName: string, entry: RegistryEntry): PayeeMatch {
  const a = new Set(normalize(enteredName).split(" ").filter(Boolean));
  const b = new Set(normalize(entry.legalName).split(" ").filter(Boolean));
  if (a.size === 0) return { matchPercent: 0, verdict: "MISMATCH", entry };

  let shared = 0;
  a.forEach((t) => {
    if (b.has(t)) shared++;
  });
  const matchPercent = Math.round((shared / Math.max(a.size, b.size)) * 100);

  return {
    matchPercent,
    verdict: matchPercent >= 85 ? "MATCH" : matchPercent >= 40 ? "PARTIAL" : "MISMATCH",
    entry,
  };
}

/** The customer's simulated 90-day average, used for the amount comparison. */
export const NINETY_DAY_AVERAGE = 18400;

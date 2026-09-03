import { formatINR, formatDateTime } from "@/lib/format";
import { SCAM_CATEGORY_LABELS, type ScamCategory } from "@/lib/ai/schema";

export type NavigatorTopic =
  | "understand_restriction"
  | "check_status"
  | "report_another"
  | "essential_payment"
  | "contact_bank";

export interface NavigatorContext {
  hasCase: boolean;
  accountStatus: string;
  incidentTitle?: string;
  scamCategory?: ScamCategory | null;
  amountAtRisk?: number;
  amountProtected?: number;
  recoveryStatus?: string;
  createdAt?: Date;
}

/**
 * Deterministic, context-aware responses for the Recovery Navigator. This is
 * intentionally NOT a general chatbot — every answer is built from the
 * customer's real incident/case data, and every workflow is clearly marked
 * as a simulated prototype flow, not real legal or banking guidance.
 */
export function buildNavigatorResponse(topic: NavigatorTopic, ctx: NavigatorContext): string {
  if (!ctx.hasCase) {
    return "You don't currently have an active protection case. Your account is operating normally.";
  }

  const categoryLabel = ctx.scamCategory && ctx.scamCategory !== "NONE" ? SCAM_CATEGORY_LABELS[ctx.scamCategory] : "a suspicious pattern";

  switch (topic) {
    case "understand_restriction":
      return `Your account was placed under protective restriction on ${
        ctx.createdAt ? formatDateTime(ctx.createdAt) : "the incident date"
      } after VIVEK identified characteristics consistent with ${categoryLabel.toLowerCase()}. This is a simulated protective workflow: essential banking (receiving funds, paying existing verified billers) stays available, while new or unverified transfers are paused pending review.`;
    case "check_status":
      return `Case status: ${ctx.recoveryStatus ?? "under review"}. Amount under review: ${formatINR(
        ctx.amountAtRisk ?? 0
      )}. Amount protected from loss: ${formatINR(ctx.amountProtected ?? 0)}. This simulated case moves through Bank Review before account restoration.`;
    case "report_another":
      return "To report another suspicious transaction or contact, open Scenario Lab → or start a new payment and Sentinel will screen it automatically. In a production deployment this would open a direct fraud-reporting channel to your bank.";
    case "essential_payment":
      return "You can still pay existing, verified billers and previously trusted beneficiaries while your account is under review. New or unverified beneficiaries remain paused until the review completes.";
    case "contact_bank":
      return "This is a simulated prototype — no real bank contact is being made. In a production deployment, this option would connect you to your bank's fraud desk with your case context pre-loaded.";
  }
}

export const NAVIGATOR_OPTIONS: { topic: NavigatorTopic; label: string }[] = [
  { topic: "understand_restriction", label: "Understand restriction" },
  { topic: "check_status", label: "Check recovery status" },
  { topic: "report_another", label: "Report another transaction" },
  { topic: "essential_payment", label: "Make an essential payment" },
  { topic: "contact_bank", label: "Contact bank" },
];

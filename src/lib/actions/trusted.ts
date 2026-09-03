"use server";

import { prisma } from "@/lib/db";
import { requireCustomer, requireTrustedContact, AuthorizationError } from "@/lib/auth/guard";
import { trustedContactSchema, trustedActionSchema } from "@/lib/validation";
import { resolveIncidentAsFalsePositive } from "@/lib/incidents";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./auth";

export async function addTrustedContactAction(input: unknown): Promise<ActionResult<{ contactId: string }>> {
  const { session, account } = await requireCustomer();
  const parsed = trustedContactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid contact details." };

  const linkedUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  const contact = await prisma.trustedContact.create({
    data: {
      accountId: account.id,
      contactUserId: linkedUser?.role === "TRUSTED_CONTACT" ? linkedUser.id : null,
      name: parsed.data.name,
      relationship: parsed.data.relationship,
      email: parsed.data.email,
      canApprove: parsed.data.canApprove,
    },
  });

  await logAudit({ userId: session.sub, actorRole: session.role, action: "TRUSTED_CONTACT_ADDED", target: `contact:${contact.id}` });
  revalidatePath("/trusted-circle");
  return { ok: true, data: { contactId: contact.id } };
}

export async function removeTrustedContactAction(contactId: string): Promise<ActionResult> {
  const { session, account } = await requireCustomer();
  const contact = await prisma.trustedContact.findUnique({ where: { id: contactId } });
  if (!contact || contact.accountId !== account.id) {
    return { ok: false, error: "Trusted contact not found." };
  }
  await prisma.trustedContact.delete({ where: { id: contactId } });
  await logAudit({ userId: session.sub, actorRole: session.role, action: "TRUSTED_CONTACT_REMOVED", target: `contact:${contactId}` });
  revalidatePath("/trusted-circle");
  return { ok: true, data: undefined };
}

export async function trustedContactActionOnTransaction(input: unknown): Promise<ActionResult<{ status: string }>> {
  const session = await requireTrustedContact();
  const parsed = trustedActionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };
  const { transactionId, action } = parsed.data;

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { account: { include: { trustedContacts: true } }, incidents: { where: { status: "ACTIVE" } } },
  });
  if (!transaction) return { ok: false, error: "Transaction not found." };

  const link = transaction.account.trustedContacts.find((c) => c.contactUserId === session.sub);
  if (!link || !link.canApprove) {
    throw new AuthorizationError("You are not an authorized trusted contact for this account.");
  }

  if (transaction.status !== "PAUSED") {
    return { ok: false, error: "This payment is no longer awaiting trusted-contact review." };
  }

  if (action === "contact_customer") {
    await prisma.intervention.updateMany({ where: { transactionId }, data: { customerChoice: `trusted_contact_reached_out:${link.name}` } });
    await logAudit({ userId: session.sub, actorRole: session.role, action: "TRUSTED_CONTACT_REACHED_OUT", target: `transaction:${transactionId}` });
    return { ok: true, data: { status: transaction.status } };
  }

  if (action === "keep_paused") {
    await prisma.intervention.updateMany({ where: { transactionId }, data: { customerChoice: `trusted_contact_kept_paused:${link.name}` } });
    await logAudit({ userId: session.sub, actorRole: session.role, action: "TRUSTED_CONTACT_KEPT_PAUSED", target: `transaction:${transactionId}` });
    return { ok: true, data: { status: transaction.status } };
  }

  // action === "approve" — deterministic backend re-authorization. The
  // trusted contact's approval is logged and enforced here; nothing in the
  // AI layer can grant this.
  const account = transaction.account;
  const newAvg = account.avgTxnAmount > 0 ? account.avgTxnAmount * 0.8 + transaction.amount * 0.2 : transaction.amount;
  await prisma.account.update({ where: { id: account.id }, data: { balance: { decrement: transaction.amount }, avgTxnAmount: newAvg } });
  await prisma.beneficiary.update({ where: { id: transaction.beneficiaryId }, data: { isFirstTime: false } });
  await prisma.transaction.update({ where: { id: transactionId }, data: { status: "COMPLETED", completedAt: new Date() } });
  await prisma.transactionEvent.create({
    data: {
      transactionId,
      type: "TRUSTED_CONTACT_APPROVED",
      label: "Approved by trusted contact",
      description: `${link.name} reviewed and approved this payment.`,
    },
  });
  await prisma.intervention.updateMany({ where: { transactionId }, data: { customerChoice: `approved_by_trusted_contact:${link.name}` } });

  for (const incident of transaction.incidents) {
    await resolveIncidentAsFalsePositive(incident.id, link.name);
  }

  await logAudit({ userId: session.sub, actorRole: session.role, action: "TRUSTED_CONTACT_APPROVED", target: `transaction:${transactionId}` });
  revalidatePath("/trusted-circle");
  return { ok: true, data: { status: "COMPLETED" } };
}

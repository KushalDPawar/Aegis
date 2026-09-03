import "server-only";
import { prisma } from "@/lib/db";

export async function listTrustedContacts(accountId: string) {
  return prisma.trustedContact.findMany({ where: { accountId }, orderBy: { createdAt: "desc" } });
}

export async function listPausedTransactionsForContact(contactUserId: string) {
  const contacts = await prisma.trustedContact.findMany({ where: { contactUserId } });
  const accountIds = contacts.map((c) => c.accountId);
  if (accountIds.length === 0) return [];
  return prisma.transaction.findMany({
    where: { accountId: { in: accountIds }, status: "PAUSED" },
    orderBy: { createdAt: "desc" },
    include: {
      beneficiary: true,
      account: { include: { user: { include: { profile: true } } } },
      riskAssessments: { orderBy: { createdAt: "desc" }, take: 1, include: { signals: true } },
      intentChecks: { orderBy: { sequence: "asc" } },
      incidents: { include: { scamPattern: true } },
    },
  });
}

export async function getPausedTransactionForContact(contactUserId: string, transactionId: string) {
  const contacts = await prisma.trustedContact.findMany({ where: { contactUserId } });
  const accountIds = contacts.map((c) => c.accountId);
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      beneficiary: true,
      account: { include: { user: { include: { profile: true } } } },
      riskAssessments: { orderBy: { createdAt: "desc" }, take: 1, include: { signals: true } },
      intentChecks: { orderBy: { sequence: "asc" } },
      incidents: { include: { scamPattern: true } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!transaction || !accountIds.includes(transaction.accountId)) return null;
  return transaction;
}

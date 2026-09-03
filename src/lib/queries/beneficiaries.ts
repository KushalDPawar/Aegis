import "server-only";
import { prisma } from "@/lib/db";

export async function listBeneficiaries(accountId: string) {
  return prisma.beneficiary.findMany({ where: { accountId }, orderBy: { createdAt: "desc" } });
}

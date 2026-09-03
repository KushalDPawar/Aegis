import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { openIncidentForCriticalTransaction, resolveIncidentAsFalsePositive, cancelIncidentByCustomer } from "@/lib/incidents";
import { createTestBeneficiary, createTestCustomer, createTestTransaction } from "./factory";

afterAll(async () => {
  await prisma.$disconnect();
});

describe("payment pause → incident → recovery lifecycle", () => {
  it("opens an incident, a recovery case, and switches the account into Financial Continuity Mode", async () => {
    const { user, account } = await createTestCustomer();
    const beneficiary = await createTestBeneficiary(account.id, { isFirstTime: true, suspiciousFlag: true, trustScore: 20 });
    const transaction = await createTestTransaction(account.id, beneficiary.id, 85_000);

    const { incident, recoveryCase } = await openIncidentForCriticalTransaction({
      transactionId: transaction.id,
      userId: user.id,
      accountId: account.id,
      amount: transaction.amount,
      severity: "CRITICAL",
      scamCategory: "KYC_IMPERSONATION",
    });

    expect(incident.status).toBe("ACTIVE");
    expect(incident.signature).toMatch(/^AEGIS-KYC-/);
    expect(incident.amountSaved).toBe(85_000);
    expect(recoveryCase.status).toBe("OPENED");
    expect(recoveryCase.amountProtected).toBe(85_000);

    const protectedAccount = await prisma.account.findUniqueOrThrow({ where: { id: account.id } });
    expect(protectedAccount.status).toBe("PROTECTED");

    const events = await prisma.recoveryEvent.findMany({ where: { recoveryCaseId: recoveryCase.id } });
    expect(events.some((e) => e.step === "INCIDENT_REPORTED" && e.status === "DONE")).toBe(true);
    expect(events.some((e) => e.step === "BANK_REVIEW" && e.status === "ACTIVE")).toBe(true);
  });

  it("restores account access once a trusted contact resolves the incident as a false positive", async () => {
    const { user, account } = await createTestCustomer();
    const beneficiary = await createTestBeneficiary(account.id, { isFirstTime: true, suspiciousFlag: true, trustScore: 20 });
    const transaction = await createTestTransaction(account.id, beneficiary.id, 50_000);

    const { incident } = await openIncidentForCriticalTransaction({
      transactionId: transaction.id,
      userId: user.id,
      accountId: account.id,
      amount: transaction.amount,
      severity: "CRITICAL",
      scamCategory: "FAMILY_EMERGENCY",
    });

    let acc = await prisma.account.findUniqueOrThrow({ where: { id: account.id } });
    expect(acc.status).toBe("PROTECTED");

    const resolved = await resolveIncidentAsFalsePositive(incident.id, "Priya (daughter)");
    expect(resolved.status).toBe("CONTAINED");

    acc = await prisma.account.findUniqueOrThrow({ where: { id: account.id } });
    expect(acc.status).toBe("ACTIVE");

    const recoveryCase = await prisma.recoveryCase.findUniqueOrThrow({ where: { incidentId: incident.id } });
    expect(recoveryCase.status).toBe("RESOLVED");
  });

  it("keeps the account protected if another incident is still active after one is resolved", async () => {
    const { user, account } = await createTestCustomer();
    const beneficiary = await createTestBeneficiary(account.id, { isFirstTime: true, suspiciousFlag: true, trustScore: 20 });
    const t1 = await createTestTransaction(account.id, beneficiary.id, 20_000);
    const t2 = await createTestTransaction(account.id, beneficiary.id, 30_000);

    const first = await openIncidentForCriticalTransaction({
      transactionId: t1.id,
      userId: user.id,
      accountId: account.id,
      amount: t1.amount,
      severity: "CRITICAL",
      scamCategory: null,
    });
    await openIncidentForCriticalTransaction({
      transactionId: t2.id,
      userId: user.id,
      accountId: account.id,
      amount: t2.amount,
      severity: "CRITICAL",
      scamCategory: null,
    });

    await resolveIncidentAsFalsePositive(first.incident.id, "Trusted Contact");

    const acc = await prisma.account.findUniqueOrThrow({ where: { id: account.id } });
    expect(acc.status).toBe("PROTECTED");
  });

  it("marks the full amount as saved when the customer cancels a paused payment", async () => {
    const { user, account } = await createTestCustomer();
    const beneficiary = await createTestBeneficiary(account.id, { isFirstTime: true, suspiciousFlag: true, trustScore: 15 });
    const transaction = await createTestTransaction(account.id, beneficiary.id, 60_000);

    const { incident } = await openIncidentForCriticalTransaction({
      transactionId: transaction.id,
      userId: user.id,
      accountId: account.id,
      amount: transaction.amount,
      severity: "CRITICAL",
      scamCategory: "DIGITAL_ARREST",
    });

    const cancelled = await cancelIncidentByCustomer(incident.id);
    expect(cancelled.status).toBe("CONTAINED");
    expect(cancelled.amountSaved).toBe(60_000);

    const recoveryCase = await prisma.recoveryCase.findUniqueOrThrow({ where: { incidentId: incident.id } });
    expect(recoveryCase.status).toBe("RESOLVED");
  });
});

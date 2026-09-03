import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import { SCAM_PATTERN_LIBRARY } from "../src/lib/scam-dna";
import { SCAM_CATEGORY_LABELS, SCAM_CATEGORIES } from "../src/lib/ai/schema";
import { DEMO_PASSWORD } from "../src/lib/demo-accounts";
import { materializeScenario } from "../src/lib/scenarios/runner";
import { openIncidentForCriticalTransaction } from "../src/lib/incidents";
import { SCENARIOS } from "../src/lib/scenarios/definitions";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Aegis demo data...");

  await prisma.recoveryEvent.deleteMany();
  await prisma.recoveryCase.deleteMany();
  await prisma.incidentEvent.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.intervention.deleteMany();
  await prisma.intentCheck.deleteMany();
  await prisma.riskSignal.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.transactionEvent.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.trustedContact.deleteMany();
  await prisma.beneficiary.deleteMany();
  await prisma.sessionEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.account.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.scamPattern.deleteMany();
  await prisma.impactMetric.deleteMany();

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  // ---------------------------------------------------------------------
  // Scam pattern library
  // ---------------------------------------------------------------------
  for (const category of SCAM_CATEGORIES) {
    const lib = SCAM_PATTERN_LIBRARY[category];
    await prisma.scamPattern.create({
      data: {
        code: category,
        name: SCAM_CATEGORY_LABELS[category],
        category,
        vector: lib.vector,
        psychology: lib.psychology,
        description: lib.description,
      },
    });
  }

  // ---------------------------------------------------------------------
  // User A — vulnerable customer
  // ---------------------------------------------------------------------
  const rajesh = await prisma.user.create({
    data: {
      email: "rajesh@aegisdemo.in",
      passwordHash,
      role: "CUSTOMER",
      profile: {
        create: {
          fullName: "Rajesh Kumar",
          age: 67,
          phone: "+91 98765 43210",
          vulnerabilityProfile: "VULNERABLE",
          avatarSeed: "Rajesh Kumar",
        },
      },
      accounts: {
        create: {
          accountNumber: "500123456789",
          nickname: "Primary Savings",
          balance: 482_000,
          avgTxnAmount: 9_500,
          status: "ACTIVE",
        },
      },
    },
    include: { accounts: true },
  });
  const rajeshAccount = rajesh.accounts[0];

  const contractor = await prisma.beneficiary.create({
    data: {
      accountId: rajeshAccount.id,
      name: "Ramesh Home Contractors",
      nickname: "Ramesh (contractor)",
      bankAccountNumber: "220098765432",
      ifsc: "HDFC0001234",
      relationship: "Contractor",
      isFirstTime: false,
      trustScore: 88,
      suspiciousFlag: false,
      category: "merchant",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 150),
    },
  });

  const pastTxn = await prisma.transaction.create({
    data: {
      accountId: rajeshAccount.id,
      beneficiaryId: contractor.id,
      amount: 40_000,
      purpose: "Advance payment for home renovation work",
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35),
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35),
    },
  });
  await prisma.transactionEvent.create({
    data: {
      transactionId: pastTxn.id,
      type: "PAYMENT_COMPLETED",
      label: "Payment completed",
      description: "Advance payment to a known, trusted contractor.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35),
    },
  });

  const electricityBoard = await prisma.beneficiary.create({
    data: {
      accountId: rajeshAccount.id,
      name: "State Electricity Board",
      nickname: "Electricity biller",
      bankAccountNumber: "999000111222",
      ifsc: "SBIN0000001",
      relationship: "Biller",
      isFirstTime: false,
      trustScore: 95,
      suspiciousFlag: false,
      category: "biller",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 400),
    },
  });
  void electricityBoard;

  // Trusted contact — Priya, Rajesh's daughter
  const priya = await prisma.user.create({
    data: {
      email: "priya@aegisdemo.in",
      passwordHash,
      role: "TRUSTED_CONTACT",
      profile: {
        create: {
          fullName: "Priya Kumar",
          age: 34,
          phone: "+91 90000 11122",
          vulnerabilityProfile: "STANDARD",
          avatarSeed: "Priya Kumar",
        },
      },
    },
  });

  await prisma.trustedContact.create({
    data: {
      accountId: rajeshAccount.id,
      contactUserId: priya.id,
      name: "Priya Kumar",
      relationship: "Daughter",
      email: "priya@aegisdemo.in",
      canApprove: true,
    },
  });

  // ---------------------------------------------------------------------
  // Impact Engine baseline (clearly-labeled synthetic network metrics)
  // ---------------------------------------------------------------------
  await prisma.impactMetric.createMany({
    data: [
      { key: "network_losses_prevented", label: "Potential losses prevented (simulated network-wide)", value: 186_500_000, unit: "INR", period: "trailing 12 months", simulated: true },
      { key: "network_customers_protected", label: "Customers protected (simulated network-wide)", value: 12_840, unit: "customers", period: "trailing 12 months", simulated: true },
      { key: "network_scam_attempts_interrupted", label: "Scam attempts interrupted (simulated network-wide)", value: 9_640, unit: "attempts", period: "trailing 12 months", simulated: true },
      { key: "network_accounts_recovered", label: "Accounts safely recovered (simulated network-wide)", value: 2_130, unit: "accounts", period: "trailing 12 months", simulated: true },
      { key: "network_essential_preserved", label: "Essential banking operations preserved (simulated network-wide)", value: 41_200, unit: "operations", period: "trailing 12 months", simulated: true },
    ],
  });

  console.log("Seed complete.");
  // ------------------------------------------------------------------
  // Estate history for the operations console.
  //
  // These run through `materializeScenario`, which invokes the real risk
  // engine and persists a genuine assessment — so every number the console
  // shows is computed by the same code path a live payment would take.
  // Hard-coding plausible-looking telemetry would make the console a
  // screenshot rather than a view of the system.
  // ------------------------------------------------------------------

  const estate: Array<{ userId: string; accountId: string; code: (typeof SCENARIOS)[number]["code"] }> = [
    { userId: rajesh.id, accountId: rajeshAccount.id, code: "KYC_IMPERSONATION" },
    { userId: rajesh.id, accountId: rajeshAccount.id, code: "DIGITAL_ARREST" },
    { userId: rajesh.id, accountId: rajeshAccount.id, code: "ELECTRICITY_SCAM" },
    { userId: rajesh.id, accountId: rajeshAccount.id, code: "LEGITIMATE_PAYMENT" },
    { userId: rajesh.id, accountId: rajeshAccount.id, code: "FAKE_INVESTMENT" },
    { userId: rajesh.id, accountId: rajeshAccount.id, code: "FAMILY_EMERGENCY" },
  ];

  let opened = 0;
  for (const entry of estate) {
    const { transactionId } = await materializeScenario(entry);
    const [transaction, assessment] = await Promise.all([
      prisma.transaction.findUniqueOrThrow({ where: { id: transactionId } }),
      prisma.riskAssessment.findFirstOrThrow({
        where: { transactionId },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    const level = assessment.overallLevel as
      | "LOW"
      | "MODERATE"
      | "HIGH"
      | "VERY_HIGH"
      | "CRITICAL";
    const definition = SCENARIOS.find((sc) => sc.code === entry.code);

    // Mirror what GUARD does at runtime: anything the engine scored as
    // VERY_HIGH or CRITICAL opens an auditable case.
    if (level === "VERY_HIGH" || level === "CRITICAL") {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: level === "CRITICAL" ? "PAUSED" : "COOLING_PERIOD" },
      });
      await openIncidentForCriticalTransaction({
        transactionId,
        userId: entry.userId,
        accountId: entry.accountId,
        amount: transaction.amount,
        severity: level,
        scamCategory: definition?.scamCategory ?? null,
      });
      opened++;
    } else if (level === "HIGH") {
      await prisma.transaction.update({ where: { id: transactionId }, data: { status: "WARNED" } });
    } else if (level === "MODERATE") {
      await prisma.transaction.update({ where: { id: transactionId }, data: { status: "VERIFY_REQUIRED" } });
    } else {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
    }

    await prisma.intervention.create({
      data: {
        transactionId,
        action: assessment.recommendedAction,
        reason: `Engine scored ${level} (decision integrity ${assessment.decisionIntegrity}).`,
        explanation:
          definition?.expectedOutcome ??
          "Proportionate friction applied based on the deterministic risk mapping.",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        actorRole: "SYSTEM",
        action: "RISK_ASSESSMENT_COMPLETED",
        target: transactionId,
        metadata: JSON.stringify({ scenario: entry.code, level, action: assessment.recommendedAction }),
      },
    });
  }
  console.log(`Estate seeded: ${estate.length} scored payments, ${opened} incidents opened.`);

  // Bank operations user for the console. No Account row: operators review
  // other people's payments, they do not hold a balance of their own.
  await prisma.user.create({
    data: {
      email: "ops@aegisdemo.in",
      passwordHash,
      role: "BANK_OPS",
      profile: {
        create: {
          fullName: "Meera Iyer",
          phone: "+91 98200 11223",
          age: 41,
          vulnerabilityProfile: "STANDARD",
          avatarSeed: "meera-ops",
        },
      },
    },
  });

  console.log("Demo accounts (password for all):", DEMO_PASSWORD);
  console.log(" - rajesh@aegisdemo.in  (vulnerable customer, CUSTOMER role)");
  console.log(" - priya@aegisdemo.in   (trusted contact, TRUSTED_CONTACT role)");
  console.log(" - ops@aegisdemo.in     (bank operations console, BANK_OPS role)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

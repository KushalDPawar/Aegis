import "server-only";
import { prisma } from "@/lib/db";

export async function listIncidents(userId: string) {
  return prisma.incident.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { scamPattern: true, transaction: { include: { beneficiary: true } } },
  });
}

export async function getIncidentDetail(incidentId: string) {
  return prisma.incident.findUnique({
    where: { id: incidentId },
    include: {
      scamPattern: true,
      events: { orderBy: { timestamp: "asc" } },
      interventions: { orderBy: { createdAt: "asc" } },
      recoveryCase: { include: { events: { orderBy: { timestamp: "asc" } } } },
      transaction: {
        include: {
          beneficiary: true,
          account: true,
          events: { orderBy: { createdAt: "asc" } },
          riskAssessments: { orderBy: { createdAt: "desc" }, include: { signals: true } },
          intentChecks: { orderBy: { sequence: "asc" } },
        },
      },
    },
  });
}

export type IncidentDetail = NonNullable<Awaited<ReturnType<typeof getIncidentDetail>>>;

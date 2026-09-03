import "server-only";
import { prisma } from "@/lib/db";

/**
 * Every privileged/state-changing action gets an audit trail entry.
 * Never log secrets, tokens, or full account numbers here.
 */
export async function logAudit(params: {
  userId?: string | null;
  actorRole: string;
  action: string;
  target: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId ?? undefined,
      actorRole: params.actorRole,
      action: params.action,
      target: params.target,
      metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
    },
  });
}

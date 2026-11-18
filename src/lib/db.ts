import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const base = new PrismaClient();
  return base.$extends({
    query: {
      auditLog: {
        update() {
          throw new Error("Audit log is append-only");
        },
        delete() {
          throw new Error("Audit log is append-only");
        },
        updateMany() {
          throw new Error("Audit log is append-only");
        },
        deleteMany() {
          throw new Error("Audit log is append-only");
        },
        upsert() {
          throw new Error("Audit log is append-only");
        },
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma as unknown as PrismaClient;
}

export async function writeAudit(entry: {
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  ip: string;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: entry.actorId ?? null,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      metadata: JSON.stringify(entry.metadata ?? {}),
      ip: entry.ip,
    },
  });
}

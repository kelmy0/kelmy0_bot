import { PrismaClient } from "@prisma/client";

export function requirePrisma(prisma: PrismaClient | undefined): PrismaClient {
  if (!prisma) throw new Error("Database not available");
  return prisma;
}

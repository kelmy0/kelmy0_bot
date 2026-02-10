import { PrismaClient } from "../../../prisma/client/client.js";


export function requirePrisma(prisma: PrismaClient | undefined): PrismaClient {
  if (!prisma) throw new Error("Banco de dados não disponível");
  return prisma;
}

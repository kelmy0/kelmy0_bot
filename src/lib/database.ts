import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaMssql } from "@prisma/adapter-mssql";
import sql from "mssql";

class Database {
  private static instance: PrismaClient;

  static async getInstance(): Promise<PrismaClient> {
    if (!Database.instance) {
      const dbConfig = {
        server: process.env.DB_SERVER || "localhost",
        port: parseInt(process.env.DB_PORT || "1433"),
        database: process.env.DB_NAME,
        user: process.env.DB_USER || "sa",
        password: process.env.DB_PASSWORD || "",
        options: {
          encrypt: process.env.DB_ENCRYPT === "true",
          trustServerCertificate: process.env.DB_TRUST_CERTIFICATE === "true",
          enableArithAbort: true,
        },
      };

      try {
        const adapter = new PrismaMssql(dbConfig);
        Database.instance = new PrismaClient({ adapter });
        console.log("✅ PrismaClient conectado com sucesso");
      } catch (error) {
        if (error instanceof Error) {
          console.error("❌ Falha na conexão:", error.message);
        } else {
          console.error("❌ Falha na conexão:", error);
        }
        throw error;
      }
    }
    return Database.instance;
  }

  static async disconnect(): Promise<void> {
    if (Database.instance) {
      await Database.instance.$disconnect();
      console.log("🔌 Conexão encerrada");
    }
  }
}

export async function getPrismaClient(): Promise<PrismaClient> {
  return await Database.getInstance();
}

export { Database };

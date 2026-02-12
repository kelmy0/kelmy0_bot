import { PrismaClient } from "@prisma/client";

class Database {
  private static instance: PrismaClient;

  static async getInstance(): Promise<PrismaClient> {
    if (!Database.instance) {
      const provider = process.env.DB_PROVIDER?.toLowerCase()!;
      const db_url = process.env.DATABASE_URL!;
      try {
        let options: any = {
          log: ["info", "warn", "error"],
        };

        if (provider === "sqlserver") {
          const { PrismaMssql } = await import("@prisma/adapter-mssql");
          options.adapter = new PrismaMssql(db_url);
          console.log("💾 Provedor definido: SQL Server");
        } else if (provider === "postgresql") {
          const { PrismaPg } = await import("@prisma/adapter-pg");
          const { default: pg } = await import("pg"!);
          const pool = new pg.Pool({ connectionString: db_url });
          options.adapter = new PrismaPg(pool);
          console.log("🐘 Provedor definido: PostgreSQL");
        } else if (provider === "mongodb") {
          console.log("🍃 Provedor definido: MongoDB");
        }

        Database.instance = new PrismaClient(options);
        await Database.instance.$connect();
        console.log("✅ PrismaClient conectado com sucesso");
      } catch (error) {
        console.error(
          "❌ Falha na conexão com o banco de dados:",
          error instanceof Error ? error.message : error,
        );
        throw error;
      }
    }
    return Database.instance;
  }
}

export const getPrismaClient = () => Database.getInstance();
export { Database };

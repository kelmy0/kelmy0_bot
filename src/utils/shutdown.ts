import { Client } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { stopAllCollectors } from "./discord/collectors.js";

export function setupShutdownHandlers(client: Client, prisma: PrismaClient) {
  let shutdownInitiated = false;
  async function shutdown(signal: string) {
    if (shutdownInitiated) return;
    shutdownInitiated = true;
    console.log(`\n🔄 Encerrando (${signal})...`);

    const timeout = setTimeout(() => {
      console.log("⚠️ Shutdown demorou demais, forçando saída...");
      process.exit(1);
    }, 3000);

    try {
      if (client?.isReady()) {
        await client.destroy();
        console.log("Discord: OK");
      }
      stopAllCollectors();
      await prisma.$disconnect();
      console.log("Banco: OK");
    } catch (err) {
      console.log("Erro durante shutdown:", err);
    } finally {
      clearTimeout(timeout);
      console.log("✅ Saindo...");
      process.exit(0);
    }
  }
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

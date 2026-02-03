import { Client } from "discord.js";
import { Database } from "../lib/database.js";

export function setupShutdownHandlers(client: Client) {
  let isShuttingDown = false;

  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`\n🔻 Recebido ${signal}, encerrando...`);

    try {
      if (client.isReady()) {
        client.destroy();
        console.log("✅ Discord desconectado");
      }

      await Promise.race([
        Database.disconnect(),
        new Promise((resolve) => setTimeout(resolve, 5000)), // Timeout de 5 segundos
      ]);
      console.log("✅ Banco desconectado");
    } catch (error) {
      console.error("❌ Erro durante shutdown:", error);
    } finally {
      setTimeout(() => {
        process.exit(0);
      }, 100);
    }
  };

  process.removeAllListeners("SIGINT");
  process.removeAllListeners("SIGTERM");

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

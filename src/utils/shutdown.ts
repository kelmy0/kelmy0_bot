import { Client } from "discord.js";
import { Database } from "../lib/database.js";

export function setupShutdownHandlers(client: Client) {
  const shutdown = async (signal: string) => {
    console.log(`\n🔻 Recebido ${signal}, encerrando...`);
    if (client.isReady()) {
      client.destroy();
      console.log("✅ Discord desconectado");
    }

    await Database.disconnect();
    console.log("✅ Banco desconectado");

    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

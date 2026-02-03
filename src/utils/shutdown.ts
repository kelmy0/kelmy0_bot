import { Client } from "discord.js";
import { Database } from "../lib/database.js";

export function setupShutdownHandlers(client: Client) {
  let shutdownInitiated = false;

  process.on("SIGINT", async () => {
    if (shutdownInitiated) return;
    shutdownInitiated = true;

    console.log("\n🔄 Encerrando (Ctrl+C)...");

    try {
      if (client?.isReady()) {
        client.destroy();
        console.log("Discord: OK");
      }
    } catch (err) {
      console.log("Discord: Erro ignorado");
    }
    Database.disconnect().catch(() => {});

    console.log("✅ Saindo...");
    process.exit(0);
  });
}

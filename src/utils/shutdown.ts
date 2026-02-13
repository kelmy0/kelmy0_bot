import { Client } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { stopAllCollectors } from "./discord/collectors.js";

export function setupShutdownHandlers(client: Client, prisma: PrismaClient) {
  let shutdownInitiated = false;
  async function shutdown(signal: string) {
    if (shutdownInitiated) return;
    shutdownInitiated = true;
    console.log(`\n🔄 Closing (${signal})...`);

    const timeout = setTimeout(() => {
      console.log("⚠️ Shutdown took too long, forcing an exit...");
      process.exit(1);
    }, 3000);

    try {
      if (client?.isReady()) {
        await client.destroy();
        console.log("Discord: disconnected");
      }
      stopAllCollectors();
      await prisma.$disconnect();
      console.log("Database: disconnected");
    } catch (err) {
      console.log("Error during shutdown:", err);
    } finally {
      clearTimeout(timeout);
      console.log("✅ Exiting...");
      process.exit(0);
    }
  }
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

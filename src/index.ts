import { getPrismaClient } from "./lib/database.js";
import { validateEnvironment } from "./config/enviroment.js";
import { createDiscordClient } from "./bot/client/index.js";
import { setupShutdownHandlers } from "./utils/shutdown.js";
import { loadEvents } from "./bot/events/loader.js";
import { config } from "dotenv";

config();
async function bootstrap() {
  try {
    console.log("🚀 Initializing Discord bot...");

    // Validate environment
    validateEnvironment();
    console.log("✅ Environment validated");

    // Initialize database
    const prisma = await getPrismaClient();
    console.log("✅ Database connected");

    // Create discord client
    const client = createDiscordClient();
    console.log("✅ Discord client created");

    // Load event handlers
    await loadEvents(client, prisma);
    console.log("✅ Events loaded");

    // Login
    await client.login(process.env.TOKEN);

    // Configure graceful shutdown
    setupShutdownHandlers(client, prisma);
  } catch (error) {
    console.error("❌ Critical failure during initialization:", error);
    process.exit(1);
  }
}
// Global error handlers
process.on("unhandledRejection", (reason) => {
  console.error("❌ Promise not resolving:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught exception:", error);
  process.exit(1);
});

bootstrap();

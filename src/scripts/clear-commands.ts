import { Client, GatewayIntentBits } from "discord.js";
import { validateScriptEnv } from "./utils/env-validator.js";
import { config } from "dotenv";

config();

async function clearTestCommands() {
  try {
    console.log("🧹Starting test command cleanup...");

    // Validate environment (production is not allowed without a test guild)
    const { token, guildTesterId, isProduction } = validateScriptEnv();

    if (isProduction) {
      console.log("⚠️ In production, it only clears commands from the test guild.");
      console.log("⚠️ Global commands will not be affected.");
    }

    if (!guildTesterId) {
      throw new Error("GUILD_TESTER_ID is required to clear commands.");
    }

    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.once("ready", async (readyClient) => {
      console.log(`🤖 Conected as ${readyClient.user.tag}`);

      const guild = readyClient.guilds.cache.get(guildTesterId);
      if (!guild) {
        throw new Error(`Test guild not found: ${guildTesterId}`);
      }

      // Gets current commands to show in the log
      const existingCommands = await guild.commands.fetch();
      console.log(`📊 Current commands in the guild: ${existingCommands.size}`);

      if (existingCommands.size > 0) {
        existingCommands.forEach((cmd) => {
          console.log(`  - ${cmd.name} (${cmd.id})`);
        });
      }

      await guild.commands.set([]);
      console.log(`✅ All commands removed from the test guild.`);
      console.log(`📌 Guild: ${guild.name} (${guild.id})`);

      readyClient.destroy();
      process.exit(0);
    });

    client.on("error", (error) => {
      console.error("❌ Error in the Discord client:", error);
      process.exit(1);
    });

    await client.login(token);
  } catch (error) {
    console.error("❌ Error clearing commands:", error);
    process.exit(1);
  }
}

setTimeout(
  () => {
    console.error("⏰ Timeout exceeded");
    process.exit(1);
  },
  2 * 60 * 1000,
);

clearTestCommands();

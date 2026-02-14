import { Client, GatewayIntentBits } from "discord.js";
import { getCommands } from "../bot/commands/loader.js";
import { validateScriptEnv } from "./utils/env-validator.js";
import { config } from "dotenv";

config();

async function deployCommands() {
  try {
    console.log("🚀 Starting command deployment...");

    const { token, clientId, guildTesterId, isProduction } = validateScriptEnv();

    const commands = await getCommands({
      environment: isProduction ? "production" : "development",
    });

    console.log(`📦 ${commands.size} commands to deploy in ${isProduction ? "produção" : "desenvolvimento"}`);

    if (commands.size === 0) {
      console.log("ℹ️ No command to register");
      return;
    }

    // Converts Map to array for the Discord API
    const commandData: any[] = [];

    for (const [name, cmd] of commands.entries()) {
      try {
        const json = cmd.data.toJSON();
        commandData.push(json);
      } catch (err) {
        console.error(`❌ Error serializing command "${name}":`, err);
      }
    }

    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.once("clientReady", async (readyClient) => {
      console.log(`🤖 Connected as ${readyClient.user.tag}`);

      if (isProduction) {
        // PRODUCTION: Register globally and clean up the testing guild
        await readyClient.application.commands.set(commandData);
        console.log(`✅ ${commandData.length} commands registered globally`);

        if (guildTesterId) {
          // Clears only commands from the test guild
          await readyClient.guilds.cache.get(guildTesterId)?.commands.set([]);
          console.log(`🧹 Commands removed from the test guild. (${guildTesterId})`);
        }
      } else {
        // DEVELOPMENT: Register only in the test guild
        if (!guildTesterId) {
          throw new Error("GUILD_TESTER_ID is required in development.");
        }

        const guild = readyClient.guilds.cache.get(guildTesterId);
        if (!guild) {
          throw new Error(`Test guild not found: ${guildTesterId}`);
        }

        await guild.commands.set(commandData);
        console.log(`✅ ${commandData.length} commands registered in the test guild`);
        console.log(`📌 Guild: ${guild.name} (${guild.id})`);
      }

      console.log("🎉 Deploy complete!");
      readyClient.destroy();
      process.exit(0);
    });

    client.on("error", (error) => {
      console.error("❌ Error in the Discord client:", error);
      process.exit(1);
    });

    // Login
    await client.login(token);
  } catch (error) {
    console.error("❌ Error in deploying:", error);
    process.exit(1);
  }
}

setTimeout(
  () => {
    console.error("⏰Timeout exceeded (5 minutes)");
    process.exit(1);
  },
  5 * 60 * 1000,
);

deployCommands();

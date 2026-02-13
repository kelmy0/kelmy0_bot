import { ApplicationCommand, Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import readline from "readline";

config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function manageGlobalCommands() {
  try {
    console.log("⚠️  ⚠️  ⚠️  GLOBAL COMMANDS MANAGEMENT ⚠️  ⚠️  ⚠️");
    console.log("This action affects ALL servers where the bot is located!\n");

    // 1. Validação básica
    if (!process.env.TOKEN || !process.env.CLIENT_ID) {
      throw new Error("TOKEN and CLIENT_ID are required!");
    }

    // 2. Lista opções
    console.log("Options:");
    console.log("1. 📋 List all globals commands now:");
    console.log("2. 🗑️  Remove a specific command (by name or ID)");
    console.log("3. 🧹 Remove ALL global commands (DANGEROUS!)");
    console.log("4. ❌ Exit");

    const option = await question("\nChoose a option (1-4): ");

    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    await client.login(process.env.TOKEN);

    client.once("ready", async (readyClient) => {
      console.log(`\n🤖 Connected as ${readyClient.user.tag}`);

      const appCommands = readyClient.application.commands;

      switch (option) {
        case "1":
          await listGlobalCommands(appCommands);
          break;

        case "2":
          await deleteSingleCommand(appCommands);
          break;

        case "3":
          await deleteAllGlobalCommands(appCommands);
          break;

        case "4":
          console.log("👋 Exiting...");
          break;

        default:
          console.log("❌ Invalid option");
      }

      readyClient.destroy();
      rl.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error:", error);
    rl.close();
    process.exit(1);
  }
}

async function listGlobalCommands(appCommands: any) {
  const commands = await appCommands.fetch();

  console.log(`\n📋 ${commands.size} Globals commands:`);
  console.log("─".repeat(50));

  commands.forEach((cmd: ApplicationCommand) => {
    console.log(`├─ ${cmd.name} (ID: ${cmd.id})`);
    console.log(`│  Description: ${cmd.description}`);
    console.log(`│  Created in: ${cmd.createdAt.toLocaleDateString()}`);
    console.log("├" + "─".repeat(48));
  });
}

async function deleteSingleCommand(appCommands: any) {
  const commands = await appCommands.fetch();

  if (commands.size === 0) {
    console.log("ℹ️  No global command to remove.");
    return;
  }

  console.log("\nAvailable commands for removal:");
  commands.forEach((cmd: ApplicationCommand, index: number) => {
    console.log(`${index + 1}. ${cmd.name} (ID: ${cmd.id})`);
  });

  const choice = await question("\nEnter the NAME or ID of the command to remove:");

  const commandToDelete = commands.find(
    (cmd: ApplicationCommand) => cmd.id === choice || cmd.name.toLowerCase() === choice.toLowerCase(),
  );

  if (!commandToDelete) {
    console.log("❌ Command not found");
    return;
  }

  console.log(`\n⚠️  You are about to remove: ${commandToDelete.name} (${commandToDelete.id})`);
  console.log("This command will be removed from ALL servers!");

  const confirm = await question('Type "YES" to confirm: ');

  if (confirm.toUpperCase() === "YES") {
    await commandToDelete.delete();
    console.log(`✅ Command "${commandToDelete.name}" removed globally`);
  } else {
    console.log("❌ Operation cancelled");
  }
}

async function deleteAllGlobalCommands(appCommands: any) {
  const commands = await appCommands.fetch();

  if (commands.size === 0) {
    console.log("ℹ️ No global command to remove.");
    return;
  }

  console.log(`\n⚠️  ⚠️  ⚠️ CRITICAL ALERT! ⚠️  ⚠️  ⚠️`);
  console.log(`You are about to remove ${commands.size} commands GLOBALLY:`);

  commands.forEach((cmd: ApplicationCommand) => {
    console.log(`  • ${cmd.name} (${cmd.id})`);
  });

  console.log("\n❗This action CANNOT be undone!");
  console.log("❗All servers will lose access to these commands.");
  console.log("❗It can take up to 1 hour for the changes to spread.");

  const confirm1 = await question('\nType "CONFIRM" to continue: ');
  if (confirm1.toUpperCase() !== "CONFIRM") {
    console.log("❌ Operation cancelled (first confirmation)");
    return;
  }

  const confirm2 = await question('Type "YES I AM SURE": ');
  if (confirm2.toUpperCase() !== "YES I AM SURE") {
    console.log("❌ Operation cancelled (second confirmation)");
    return;
  }

  console.log("\n🧹 Removing global commands...");

  // Remove um por um com delay para evitar rate limits
  for (const cmd of commands.values()) {
    try {
      await cmd.delete();
      console.log(`✅ Removed: ${cmd.name}`);
      await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay
    } catch (error) {
      console.error(`❌ Error removing ${cmd.name}:`, error);
    }
  }

  console.log("🎉 All global commands have been removed.");
}

// Timeout de segurança
setTimeout(
  () => {
    console.error("⏰ Timeout exceeded (5 minutes)");
    rl.close();
    process.exit(1);
  },
  5 * 60 * 1000,
);

manageGlobalCommands();

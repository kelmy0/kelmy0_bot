import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Command } from "./types/Command.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands: Command[] = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const fileUrl = pathToFileURL(filePath).href;
  const commandModule = await import(fileUrl);
  const command: Command = commandModule.default;
  commands.push(command);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async (readyClient) => {
  console.log(`Logado como ${readyClient.user.tag}`);

  const commandData = commands.map((cmd) => cmd.data.toJSON());

  if (process.env.NODE_ENV === "production") {
    await readyClient.application.commands.set(commandData);
    console.log("✅ Comandos registrados globalmente");
    const guildId = process.env.GUILD_ID!;
    await readyClient.guilds.cache.get(guildId)?.commands.set([]);
    console.log("🧹 Comandos de teste removidos da guild");
  } else {
    const guildId = process.env.GUILD_ID!;
    await readyClient.guilds.cache.get(guildId)?.commands.set(commandData);
    console.log("✅ Comandos registrados no servidor de teste");
  }

  process.exit(0); // encerra o script depois de registrar
});

client.login(process.env.TOKEN);

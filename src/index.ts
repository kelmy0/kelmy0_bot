import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { loadEvents } from "./load-events.js";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

async function main() {
  // Carregar eventos
  await loadEvents(client);

  // Login
  await client.login(process.env.TOKEN);
}

main();

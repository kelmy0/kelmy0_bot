import { GatewayIntentBits } from "discord.js";

export function getIntents() {
  return [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ];
}

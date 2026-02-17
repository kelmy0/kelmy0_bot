import { GatewayIntentBits, Partials } from "discord.js";

export function getIntents() {
  return [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ];
}

export function getPartials() {
  return [Partials.Message, Partials.Channel];
}

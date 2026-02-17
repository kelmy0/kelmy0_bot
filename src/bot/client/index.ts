import { Client } from "discord.js";
import { getIntents, getPartials } from "./client-config.js";

export function createDiscordClient(): Client {
  return new Client({
    intents: getIntents(),
    partials: getPartials(),
  });
}

export type DiscordClient = ReturnType<typeof createDiscordClient>;

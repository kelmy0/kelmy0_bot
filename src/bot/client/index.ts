import { Client } from "discord.js";
import { getIntents } from "./intents.js";

export function createDiscordClient(): Client {
  return new Client({
    intents: getIntents(),
    partials: [],
  });
}

export type DiscordClient = ReturnType<typeof createDiscordClient>;

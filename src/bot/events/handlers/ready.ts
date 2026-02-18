import { Client } from "discord.js";
import { BotEvent } from "../../../types/index.js";

export default {
  name: "clientReady",
  once: true,
  async execute(client: Client) {
    if (!client.user) {
      console.error("No client");
      return;
    }

    console.log(`🤖 Bot online as ${client.user.tag}`);

    const guilds = client.guilds.cache;
    console.log(`📊 Conected in ${guilds.size} guilds`);
  },
} satisfies BotEvent;

import { Client } from "discord.js";

export default {
  name: "clientReady",
  once: true,
  async execute(client: Client) {
    if (!client.user) {
      console.error("No client");
      return;
    }
    console.log(`✅ Bot online como ${client.user.tag}`);
  },
};

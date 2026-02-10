import { Client } from "discord.js";
import { PrismaClient } from "@prisma/client";

export default {
  name: "clientReady",
  once: true,
  async execute(client: Client, prisma: PrismaClient) {
    if (!client.user) {
      console.error("No client");
      return;
    }

    console.log(`🤖 Bot online como ${client.user.tag}`);

    const guilds = client.guilds.cache;
    console.log(`📊 Conectado em ${guilds.size} servidores`);
  },
};

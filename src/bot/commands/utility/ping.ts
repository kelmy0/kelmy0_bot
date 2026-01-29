import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../types/Command.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Responde com Pong!"),
  metadata: {
    category: "utility",
    production: true,
    description: "Responde pong!",
    cooldown: 5,
  },
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply("Pong! " + interaction.client.ws.ping + "ms.");
  },
} satisfies Command;

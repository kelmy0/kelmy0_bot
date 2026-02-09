import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../../types/Command.js";

export default {
  data: new SlashCommandBuilder()
    .setName("get-miside-picture")
    .setDescription("Envia uma foto aleatória de Miside"),
  metadata: {
    category: "fun",
    production: true,
    description: "Envia uma foto aleatória de Miside",
    cooldown: 5,
  },
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply("https://youtu.be/LlXwe-TrLlY?si=8EAxXv2jqpAmVx1m");
  },
} satisfies Command;

import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../types/Command.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Reply pong!")
    .setDescriptionLocalization("pt-BR", "Responde pong!"),

  metadata: {
    category: "utility",
    production: true,
    cooldown: 5,
  },
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply("Pong! " + interaction.client.ws.ping + "ms.");
  },
} satisfies Command;

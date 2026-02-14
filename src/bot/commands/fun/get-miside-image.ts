import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../../types/Command.js";
import { Translator } from "../../../types/Command.js";

export default {
  data: new SlashCommandBuilder()
    .setName("get-miside-picture")
    .setNameLocalizations({ "pt-BR": "pegar-imagem-miside" })
    .setDescription("Send a random Miside picture")
    .setDescriptionLocalizations({ "pt-BR": "Envia uma foto aleatória de Miside" }),
  metadata: {
    category: "fun",
    production: true,
  },
  async execute(interaction: ChatInputCommandInteraction, t: Translator) {
    await interaction.reply("https://youtu.be/LlXwe-TrLlY?si=8EAxXv2jqpAmVx1m");
  },
} satisfies Command;

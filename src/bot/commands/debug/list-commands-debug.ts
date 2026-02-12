import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../../../types/Command.js";
import { getCommands } from "../loader.js";
import { CommandsEmbedHelper } from "../../../utils/discord/embeds/commandsEmbedHelper.js";
import { Translator } from "../../../types/Command.js";
export default {
  data: new SlashCommandBuilder()
    .setName("list-commands-debug")
    .setDescription("Lista todos os comandos por categoria (DEBUG)"),

  async execute(interaction: ChatInputCommandInteraction, t: Translator) {
    await interaction.deferReply();
    const commands = await getCommands();
    CommandsEmbedHelper.createPaginatedCommandEmbed(interaction, commands, t);
  },

  metadata: {
    category: "debug",
    production: false,
  },
} satisfies Command;

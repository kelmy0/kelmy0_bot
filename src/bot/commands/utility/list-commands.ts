import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../types/Command.js";
import { getCommands } from "../loader.js";
import { CommandsEmbedHelper } from "../../../utils/discord/embeds/commandsEmbedHelper.js";

export default {
  data: new SlashCommandBuilder()
    .setName("list-commands")
    .setDescription("Lista todos os comandos do bot por categoria."),

  metadata: {
    category: "utility",
    production: true,
  },

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const commands = await getCommands({ environment: "production", excludeCategories: ["debug"] });
    CommandsEmbedHelper.createPaginatedCommandEmbed(interaction, commands);
  },
} satisfies Command;

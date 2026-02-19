import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../../../types/Command.js";
import { getCommands } from "../loader.js";
import { CommandsEmbedHelper } from "../../../utils/index.js";
import { Translator } from "../../../types/Command.js";

export default {
  data: new SlashCommandBuilder()
    .setName("list-commands-debug")
    .setNameLocalizations({ "pt-BR": "listar-comandos-debug" })
    .setDescription("List all commands per category (DEBUG)")
    .setDescriptionLocalizations({ "pt-BR": "Lista todos os comandos por categoria (DEBUG)" }),

  metadata: {
    category: "debug",
    production: false,
  },

  async execute(interaction: ChatInputCommandInteraction, t: Translator) {
    const commands = await getCommands();
    await CommandsEmbedHelper.createPaginatedCommandEmbed(interaction, commands, t);
  },
} satisfies Command;

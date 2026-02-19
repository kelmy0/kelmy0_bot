import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { PrismaClient } from "@prisma/client";
import type { Command, CommandInfo } from "../../../types/Command.js";
import { CommandsEmbedHelper, executeWithCache, handleCommandError } from "../../../utils/index.js";
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

  async execute(
    interaction: ChatInputCommandInteraction,
    t: Translator,
    prisma?: PrismaClient,
    commands?: Map<string, Command>,
  ) {
    const locale = interaction.locale;
    const cacheKey = `list:commands:debug:${locale}`;

    await executeWithCache<CommandInfo[]>({
      interaction,
      cacheKey,
      ttl: 3600,
      ephemeral: true,
      executeService: async () => {
        if (!commands) throw new Error("Commands map not provided");

        const liteData = Array.from(commands.values())
          .filter((c) => c.metadata.production && c.metadata.category !== "debug")
          .map((c) => ({
            name: c.data.name_localizations?.[locale] || c.data.name,
            description: c.data.description_localizations?.[locale] || c.data.description,
            category: c.metadata.category,
          }));

        return { message: "Success", success: true, data: liteData, timestamp: new Date() };
      },

      renderSuccess: (data) => CommandsEmbedHelper.createPaginatedCommandEmbed(interaction, data, t),
      handleError: (err) => handleCommandError(interaction, "list-commands-debug", err, t),
    });
  },
} satisfies Command;

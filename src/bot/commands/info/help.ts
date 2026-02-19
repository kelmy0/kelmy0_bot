import { ApplicationIntegrationType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { Command, CommandInfo, Translator } from "../../../types/Command.js";
import { CommandsEmbedHelper, executeWithCache, handleCommandError } from "../../../utils/index.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setNameLocalizations({ "pt-BR": "ajuda" })
    .setDescription("List all bot's commands per category")
    .setDescriptionLocalizations({ "pt-BR": "Lista todos os comandos do bot por categoria" })
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall),

  metadata: {
    category: "info",
    production: true,
    cooldown: 1,
  },

  async execute(
    interaction: ChatInputCommandInteraction,
    t: Translator,
    prisma?: PrismaClient,
    commands?: Map<string, Command>,
  ) {
    const locale = interaction.locale;
    const cacheKey = `help:list:${locale}`;

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
      handleError: (err) => handleCommandError(interaction, "help", err, t),
    });
  },
} satisfies Command;

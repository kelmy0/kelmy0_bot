import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  InteractionContextType,
  ApplicationIntegrationType,
} from "discord.js";
import { Command, Translator } from "../../../types/Command.js";
import { handleCommandError, BanEmbedHelper, executeWithCache } from "../../../utils/index.js";

export default {
  data: new SlashCommandBuilder()
    .setName("list-bans")
    .setNameLocalizations({ "pt-BR": "listar-banimentos" })
    .setDescription("List all banned members")
    .setDescriptionLocalizations({ "pt-BR": "Lista todos os membros banidos" })
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall),

  metadata: {
    category: "moderation",
    production: true,
  },

  async execute(interaction: ChatInputCommandInteraction, t: Translator): Promise<void> {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
      return await handleCommandError(
        interaction,
        "list-bans",
        new Error(t("common.errors.no_permission")),
        t,
      );
    }

    if (!interaction.guild) {
      return await handleCommandError(interaction, "list-bans", new Error(t("common.errors.no_guild")), t);
    }

    await executeWithCache({
      interaction: interaction,
      cacheKey: `bans:list:${interaction.guild.id}`,
      executeService: async () => {
        const fetched = await interaction.guild!.bans.fetch({ limit: 20 });
        const users = fetched.map((b) => b.user);
        return {
          success: true,
          data: users,
          message: "Bans fetched successfully!",
          timestamp: new Date(),
        };
      },
      renderSuccess: (users) => BanEmbedHelper.createPaginatedBanEmbed(interaction, users, t),
      handleError: (err) => handleCommandError(interaction, "list-bans", err, t),
      ttl: 60,
      ephemeral: true,
    });
  },
} satisfies Command;

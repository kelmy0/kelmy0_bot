import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { Command, Translator } from "../../../types/Command.js";
import { handleCommandError, BanEmbedHelper } from "../../../utils/index.js";

export default {
  data: new SlashCommandBuilder()
    .setName("unban-member")
    .setNameLocalizations({ "pt-BR": "desbanir-membro" })
    .setDescription("Unban a user from server")
    .setDescriptionLocalizations({ "pt-BR": "Desbanir um membro" })
    .addStringOption((option) =>
      option
        .setName("userid")
        .setNameLocalizations({ "pt-BR": "usuario" })
        .setDescription("User ID to be unbanned")
        .setDescriptionLocalizations({ "pt-BR": "ID do usuário a ser desbanido" })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setNameLocalizations({ "pt-BR": "motivo" })
        .setDescription("Unban reason")
        .setDescriptionLocalizations({ "pt-BR": "Motivo do banimento" })
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall),

  metadata: {
    category: "moderation",
    production: true,
  },

  async execute(interaction: ChatInputCommandInteraction, t: Translator) {
    try {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
        throw new Error(t("common.errors.no_permission"));
      }

      if (!interaction.guild) {
        throw new Error(t("common.errors.no_guild"));
      }

      const unbanId = interaction.options.getString("userid", true);
      const reason = interaction.options.getString("reason", true);

      await interaction.deferReply({ flags: "Ephemeral" });

      const unbanMember = await interaction.guild.bans.fetch(unbanId);

      await interaction.guild.members.unban(unbanId, reason);

      await BanEmbedHelper.createSingleBanEmbed(
        interaction,
        t("commands.moderation.unban-member.title"),
        reason,
        unbanMember,
        t,
      );
    } catch (error) {
      await handleCommandError(interaction, "unban-member", error, t);
    }
  },
} satisfies Command;

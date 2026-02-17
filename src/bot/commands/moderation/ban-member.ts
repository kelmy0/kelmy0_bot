import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  User,
} from "discord.js";
import { Command, Translator } from "../../../types/Command.js";
import { handleCommandError, BanEmbedHelper } from "../../../utils/index.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ban-member")
    .setNameLocalizations({ "pt-BR": "banir-membro" })
    .setDescription("Ban a member")
    .setDescriptionLocalizations({ "pt-BR": "Banir um membro" })
    .addUserOption((option) =>
      option
        .setName("user")
        .setNameLocalizations({ "pt-BR": "usuario" })
        .setDescription("User to be banned")
        .setDescriptionLocalizations({ "pt-BR": "Usuário a ser banido" })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setNameLocalizations({ "pt-BR": "motivo" })
        .setDescription("Ban reason")
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

  async execute(interaction: ChatInputCommandInteraction, t: Translator): Promise<void> {
    await interaction.deferReply();

    const memberBanned = interaction.options.getUser("user", true) as User;
    const reason = interaction.options.getString("reason", true);
    try {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
        throw new Error(t("common.errors.no_permission"));
      }

      if (!interaction.guild) {
        throw new Error(t("common.errors.no_guild"));
      }

      const member = await interaction.guild.members.fetch(memberBanned.id).catch(() => null);
      if (!member) {
        throw new Error(t("common.errors.user_not_found"));
      }

      await member.ban({ reason });
      await BanEmbedHelper.createSingleBanEmbed(
        interaction,
        t("commands.moderation.ban-member.title"),
        reason,
        member.user.tag,
        t,
      );
    } catch (error) {
      await handleCommandError(interaction, "ban-member", error, t);
    }
  },
} satisfies Command;

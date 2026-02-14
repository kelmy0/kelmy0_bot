import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, User } from "discord.js";
import { Command, Translator } from "../../../types/Command.js";
import { handleCommandError, BanEmbedHelper } from "../../../utils/index.js";

export default {
  data: new SlashCommandBuilder()
    .setName("kick-member")
    .setNameLocalizations({ "pt-BR": "expulsar-membro" })
    .setDescription("Kick a member")
    .setDescriptionLocalizations({ "pt-BR": "Expulsa um membro" })
    .addUserOption((option) =>
      option
        .setName("user")
        .setNameLocalizations({ "pt-BR": "usuario" })
        .setDescription("User to be kicked")
        .setDescriptionLocalizations({ "pt-BR": "Usuário a ser expulso" })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setNameLocalizations({ "pt-BR": "motivo" })
        .setDescription("Kick reason")
        .setDescriptionLocalizations({ "pt-BR": "Motivo da expulsão" })
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  metadata: {
    category: "moderation",
    production: true,
  },

  async execute(interaction: ChatInputCommandInteraction, t: Translator): Promise<void> {
    await interaction.deferReply();

    const memberKicked = interaction.options.getUser("user", true) as User;
    const reason = interaction.options.getString("reason", true);

    try {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.KickMembers)) {
        throw new Error(t("common.errors.no_permission"));
      }

      if (!interaction.guild) {
        throw new Error(t("common.errors.no_guild"));
      }

      const member = await interaction.guild.members.fetch(memberKicked.id).catch(() => null);

      if (!member) {
        throw new Error(t("common.errors.user_not_found"));
      }

      await member.kick(reason);
      await BanEmbedHelper.createSingleBanEmbed(
        interaction,
        t("commands.moderation.kick-member.title"),
        reason,
        member.user.tag,
        t,
      );
    } catch (error) {
      await handleCommandError(interaction, "kick-member", error, t);
    }
  },
} satisfies Command;

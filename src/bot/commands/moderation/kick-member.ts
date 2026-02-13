import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, User } from "discord.js";
import { Command } from "../../../types/Command.js";
import { handleCommandError } from "../../../utils/discord/commandHelpers.js";
import { BanEmbedHelper } from "../../../utils/discord/embeds/banEmbedHelper.js";

export default {
  data: new SlashCommandBuilder()
    .setName("kick-member")
    .setNameLocalization("pt-BR", "expulsar-membro")
    .setDescription("Kick a member")
    .setDescriptionLocalization("pt-BR", "Expulsa um membro")
    .addUserOption((option) =>
      option
        .setName("user")
        .setNameLocalization("pt-BR", "usuario")
        .setDescription("User to be kicked")
        .setDescriptionLocalization("pt-BR", "Usuário a ser expulso")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setNameLocalization("pt-BR", "motivo")
        .setDescription("Kick reason")
        .setDescriptionLocalization("pt-BR", "Motivo da expulsão")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  metadata: {
    category: "moderation",
    production: true,
  },

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const memberKicked = interaction.options.getUser("user", true) as User;
    const reason = interaction.options.getString("reason", true);

    try {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.KickMembers)) {
        throw new Error("Você não tem permissão para kickar membros.");
      }

      if (!interaction.guild) {
        throw new Error("Não foi possivel achar o servidor!");
      }

      const member = await interaction.guild.members.fetch(memberKicked.id).catch(() => null);

      if (!member) {
        throw new Error("Não encontrei esse usuário no servidor.");
      }

      await member.kick(reason);
      await BanEmbedHelper.createSingleBanEmbed(interaction, "👟Kick", reason, member.user.tag);
    } catch (error) {
      await handleCommandError(interaction, "kick-member", error);
    }
  },
} satisfies Command;

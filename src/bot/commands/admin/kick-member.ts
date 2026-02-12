import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, User } from "discord.js";
import { Command } from "../../../types/Command.js";

export default {
  data: new SlashCommandBuilder()
    .setName("kick-member")
    .setDescription("Kick a member from server")
    .addUserOption((option) => option.setName("user").setDescription("User to be kicked").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Kick reason").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  metadata: {
    category: "admin",
    production: true,
  },

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const memberKicked = interaction.options.getUser("user", true) as User;
    const reason = interaction.options.getString("reason", true);

    const user = interaction.user;

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.KickMembers)) {
      await interaction.editReply("❌Você não tem permissão para kickar membros.");
    }

    const member = await interaction.guild?.members.fetch(memberKicked.id).catch(() => null);
    if (!member) {
      await interaction.editReply("❌Não encontrei esse usuário no servidor.");
      return;
    }

    try {
      await member.kick(reason);
      await interaction.editReply(`🚫✅ ${memberKicked.tag} foi kickado por ${user.tag}. Motivo: ${reason}`);
    } catch (error) {
      await interaction.editReply(
        "❌ Não consegui kickar esse usuário. Verifique se o bot tem permissão e se a hierarquia de cargos permite.",
      );
    }
  },
} satisfies Command;

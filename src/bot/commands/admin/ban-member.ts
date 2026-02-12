import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, User } from "discord.js";
import { Command } from "../../../types/Command.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ban-member")
    .setDescription("Ban a member from server")
    .addUserOption((option) => option.setName("user").setDescription("User to be banned").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Ban reason").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  metadata: {
    category: "admin",
    production: true,
  },

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const memberBanned = interaction.options.getUser("user", true) as User;
    const reason = interaction.options.getString("reason", true);

    const user = interaction.user;

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
      await interaction.editReply("❌Você não tem permissão para banir membros.");
    }

    const member = await interaction.guild?.members.fetch(memberBanned.id).catch(() => null);
    if (!member) {
      await interaction.editReply("❌Não encontrei esse usuário no servidor.");
      return;
    }
    try {
      await member.ban({ reason });
      await interaction.editReply(`🚫✅${memberBanned.tag} foi banido por ${user.tag}. Motivo: ${reason}`);
    } catch (error) {
      await interaction.editReply(
        "❌ Não consegui banir esse usuário. Verifique se o bot tem permissão e se a hierarquia de cargos permite.",
      );
    }
  },
} satisfies Command;

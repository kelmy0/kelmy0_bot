import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../types/Command.js";

export default {
  data: new SlashCommandBuilder()
    .setName("Unban a user from server")
    .addStringOption((option) =>
      option.setName("userid").setDescription("User ID to be unbanned").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Motivo do desban").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  metadata: {
    category: "admin",
    production: true,
  },

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const user = interaction.user;

    const unbanId = interaction.options.getString("userid", true);
    const reason = interaction.options.getString("reason", true);

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
      await interaction.editReply("❌Você não tem permissão para desbanir membros.");
      return;
    }

    try {
      await interaction.guild?.members.unban(unbanId, reason);
      await interaction.editReply(
        `✅ Usuário com ID ${unbanId} foi desbanido por ${user.tag}. Motivo: ${reason}`,
      );
    } catch (error) {
      await interaction.editReply("❌ Não consegui desbanir esse usuário. Verifique se o ID está correto.");
    }
  },
} satisfies Command;

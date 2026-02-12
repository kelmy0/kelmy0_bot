import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { Command } from "../../../types/Command.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ban-list")
    .setDescription("Lista todos os usuários banidos do servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  metadata: {
    category: "admin",
    production: true,
  },

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
      await interaction.editReply("❌Você não tem permissão para ver a lista de banidos.");
      return;
    }

    try {
      const bans = await interaction.guild?.bans.fetch();
      if (!bans || bans.size === 0) {
        await interaction.editReply("✅ Não há usuários banidos neste servidor.");
        return;
      }

      const banList = bans
        .map((ban) => `${ban.user.tag} (ID: ${ban.user.id}) - Motivo: ${ban.reason ?? "Sem motivo"}`)
        .join("\n");

      await interaction.editReply(`🚫 Lista de usuários banidos:\n${banList}`);
    } catch (error) {
      await interaction.editReply("❌ Não consegui recuperar a lista de banidos.");
    }
  },
} satisfies Command;

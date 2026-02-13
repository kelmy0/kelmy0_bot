import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../types/Command.js";
import { BanEmbedHelper } from "../../../utils/discord/embeds/banEmbedHelper.js";
import { handleCommandError } from "../../../utils/discord/commandHelpers.js";

export default {
  data: new SlashCommandBuilder()
    .setName("unban-member")
    .setNameLocalization("pt-BR", "desbanir-membro")
    .setDescription("Unban a user from server")
    .setDescriptionLocalization("pt-BR", "Desbanir um membro")
    .addStringOption((option) =>
      option
        .setName("userid")
        .setNameLocalization("pt-BR", "usuario")
        .setDescription("User ID to be unbanned")
        .setDescriptionLocalization("pt-BR", "ID do usuário a ser desbanido")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setNameLocalization("pt-BR", "motivo")
        .setDescription("Unban reason")
        .setDescriptionLocalization("pt-BR", "Motivo do banimento")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  metadata: {
    category: "moderation",
    production: true,
  },

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const unbanId = interaction.options.getString("userid", true);
    const reason = interaction.options.getString("reason", true);
    try {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
        throw new Error("Você não tem permissão para desbanir membros.");
      }

      if (!interaction.guild) {
        throw new Error("Não foi possivel achar o servidor!");
      }

      const unbanMember = (await interaction.guild.bans.fetch(unbanId)).user.tag;

      await interaction.guild.members.unban(unbanId, reason);

      await BanEmbedHelper.createSingleBanEmbed(interaction, "🔓Unban", reason, unbanMember);
    } catch (error) {
      await handleCommandError(interaction, "unban-member", error);
    }
  },
} satisfies Command;

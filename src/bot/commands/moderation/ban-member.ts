import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, User } from "discord.js";
import { Command } from "../../../types/Command.js";
import { handleCommandError } from "../../../utils/discord/commandHelpers.js";
import { BanEmbedHelper } from "../../../utils/discord/embeds/banEmbedHelper.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ban-member")
    .setDescription("Ban a member from server")
    .addUserOption((option) => option.setName("user").setDescription("User to be banned").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Ban reason").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  metadata: {
    category: "moderation",
    production: true,
  },

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const memberBanned = interaction.options.getUser("user", true) as User;
    const reason = interaction.options.getString("reason", true);
    try {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
        throw new Error("Você não tem permissão para banir membros.");
      }

      if (!interaction.guild) {
        throw new Error("Não foi possivel achar o servidor!");
      }

      const member = await interaction.guild.members.fetch(memberBanned.id).catch(() => null);
      if (!member) {
        throw new Error("Não encontrei esse usuário no servidor.");
      }

      await member.ban({ reason });
      await BanEmbedHelper.createSingleBanEmbed(interaction, "🚫Banimento", reason, member.user.tag);
    } catch (error) {
      await handleCommandError(interaction, "ban-member", error);
    }
  },
} satisfies Command;

import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { Command } from "../../../types/Command.js";
import { BanEmbedHelper } from "../../../utils/discord/embeds/banEmbedHelper.js";
import { handleCommandError } from "../../../utils/discord/commandHelpers.js";
import { Translator } from "../../../types/Command.js";

export default {
  data: new SlashCommandBuilder()
    .setName("list-ban")
    .setNameLocalization("pt-BR", "listar-banimentos")
    .setDescription("List all banned members")
    .setDescriptionLocalization("pt-BR", "Lista todos os membros banidos")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  metadata: {
    category: "moderation",
    production: true,
  },

  async execute(interaction: ChatInputCommandInteraction, t: Translator): Promise<void> {
    await interaction.deferReply();
    try {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
        throw new Error("Você não tem permissão para ver a lista de banidos.");
      }

      if (!interaction.guild) {
        throw new Error("Não foi possivel requisitar a guild");
      }

      const fetched = await interaction.guild.bans.fetch({ limit: 20 });
      const users = fetched.map((u) => u.user);
      BanEmbedHelper.createPaginatedBanEmbed(interaction, users, t);
    } catch (error) {
      await handleCommandError(interaction, "ban-list", error);
    }
  },
} satisfies Command;

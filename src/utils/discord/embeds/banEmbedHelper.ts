import { ChatInputCommandInteraction, EmbedBuilder, User } from "discord.js";
import { EmbedHelpers } from "./embedHelpers.js";
import { PaginationHelper } from "./paginationHelper.js";
import { Translator } from "../../../types/Command.js";

export class BanEmbedHelper {
  static async createSingleBanEmbed(
    interaction: ChatInputCommandInteraction,
    title: string,
    reason: string,
    member: string,
  ) {
    const embed = EmbedHelpers.createEmbed({
      title: title,
      thumbnail: interaction.guild?.iconURL(),
      author: {
        name: `Ação de Moderação`,
        iconURL: interaction.guild?.iconURL() || undefined,
      },
      color: /unban/i.test(title) ? "#2ecc71" : "#e74c3c",
      footer: {
        text: `ID do Executor: ${interaction.user.id}`,
        iconURL: interaction.user.displayAvatarURL(),
      },
      timestamp: true,
    });

    embed.addFields(
      {
        name: "👤 Usuário Atigido",
        value: `\`${member}\``,
        inline: true,
      },
      {
        name: "🛡️ Moderador Responsável",
        value: `${interaction.user}`,
        inline: true,
      },
      {
        name: "📝 Motivo",
        value: `\`\`\`${reason}\`\`\``,
        inline: false,
      },
    );

    await interaction.editReply({ embeds: [embed] });
  }

  static async createPaginatedBanEmbed(
    interaction: ChatInputCommandInteraction,
    users: User[],
    t: Translator,
  ) {
    return PaginationHelper.createPagination(
      interaction,
      users,
      (currentUsers, page, total) => {
        return this.createBanListEmbed(interaction, page, total, currentUsers);
      },
      20,
      t,
    );
  }

  private static createBanListEmbed(
    interaction: ChatInputCommandInteraction,
    currentPage: number,
    totalPages: number,
    users: User[],
  ): EmbedBuilder {
    const embed = EmbedHelpers.createEmbed({
      title: "👥 Banned users",
      description: "",
      thumbnail: interaction.guild?.iconURL(),
      color: "#692904",
      footer: {
        text: `Página ${currentPage + 1}/${totalPages}`,
        iconURL: interaction.client.user.displayAvatarURL(),
      },
      timestamp: true,
    });

    const content = users
      .map((user) => {
        return `👤 **${user.username}**\nID: \`${user.id}\``;
      })
      .join("\n\n");

    embed.setDescription(`${interaction.guild?.name}\n\n${content}`);

    return embed;
  }
}

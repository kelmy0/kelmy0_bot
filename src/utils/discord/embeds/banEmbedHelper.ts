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
    t: Translator,
  ) {
    const embed = EmbedHelpers.createEmbed({
      title: title,
      thumbnail: interaction.guild?.iconURL(),
      author: {
        name: t("commands.moderation.common.action_name"),
        iconURL: interaction.guild?.iconURL() || undefined,
      },
      color: /unban/i.test(title) ? "#2ecc71" : "#e74c3c",
      footer: {
        text: t("commands.moderation.common.footer", {
          name: interaction.user.tag,
          guild: interaction.guild?.name,
        }),
        iconURL: interaction.user.displayAvatarURL(),
      },
      timestamp: true,
    });

    embed.addFields(
      {
        name: t("common.words.user_target"),
        value: `\`${member}\``,
        inline: true,
      },
      {
        name: t("common.words.moderator"),
        value: `${interaction.user}`,
        inline: true,
      },
      {
        name: t("common.words.guild"),
        value: `${interaction.guild?.name}`,
        inline: false,
      },
      {
        name: t("common.words.reason"),
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
        return this.createBanListEmbed(interaction, page, total, currentUsers, t);
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
    t: Translator,
  ): EmbedBuilder {
    const embed = EmbedHelpers.createEmbed({
      title: t("commands.moderation.list-bans.title"),
      thumbnail: interaction.guild?.iconURL(),
      color: "#692904",
      footer: {
        text: t("commands.moderation.list-bans.footer_text", {
          currentPage: currentPage + 1,
          totalPages: totalPages,
        }),
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

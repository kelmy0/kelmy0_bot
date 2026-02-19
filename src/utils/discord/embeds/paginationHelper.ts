import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import { EmbedHelpers } from "./embedHelpers.js";
import { registerCollector } from "../collectors.js";
import { Translator } from "../../../types/Command.js";

export class PaginationHelper {
  static async createPagination<T>(
    interaction: ChatInputCommandInteraction,
    items: T[],
    renderPage: (items: T[], page: number, totalPages: number) => EmbedBuilder,
    itemsPerPage: number = 1,
    t: Translator,
  ) {
    if (items.length === 0) {
      return EmbedHelpers.createEmptyEmbed(t("common.placeholders.no_data"), interaction);
    }

    let currentPage = 0;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    const getRow = (page: number) => {
      const min = page === 0;
      const max = page === totalPages - 1;
      return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("first")
          .setLabel("⏪")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(min),
        new ButtonBuilder().setCustomId("prev").setLabel("◀️").setStyle(ButtonStyle.Primary).setDisabled(min),
        new ButtonBuilder()
          .setCustomId("page")
          .setLabel(`${page + 1}/${totalPages}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder().setCustomId("next").setLabel("▶️").setStyle(ButtonStyle.Primary).setDisabled(max),
        new ButtonBuilder().setCustomId("last").setLabel("⏩").setStyle(ButtonStyle.Primary).setDisabled(max),
      );
    };

    const initialEmbed = renderPage(
      items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage),
      currentPage,
      totalPages,
    );

    const payload = {
      embeds: [initialEmbed],
      components: totalPages > 1 ? [getRow(currentPage)] : [],
    };

    let message;

    if (interaction.deferred || interaction.replied) {
      message = await interaction.editReply(payload);
    } else {
      message = await interaction.reply(payload);
    }

    if (totalPages <= 1) return;

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000, // 5 minutos
    });

    registerCollector(collector);

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: t("common.errors.interaction_not_author"), ephemeral: true });
      }

      if (i.customId === "first") currentPage = 0;
      if (i.customId === "prev") currentPage--;
      if (i.customId === "next") currentPage++;
      if (i.customId === "last") currentPage = totalPages - 1;

      const updatedEmbed = renderPage(
        items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage),
        currentPage,
        totalPages,
      );

      await i.update({
        embeds: [updatedEmbed],
        components: [getRow(currentPage)],
      });
    });

    collector.on("end", () => {
      message.edit({ components: [] }).catch(() => {});
    });
  }
}

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import { EmbedHelpers } from "./embedHelpers.js";

export class PaginationHelper {
  static async createPagination<T>(
    interaction: ChatInputCommandInteraction,
    items: T[],
    renderPage: (items: T[], page: number, totalPages: number) => EmbedBuilder,
    itemsPerPage: number = 1,
  ) {
    if (items.length === 0) {
      return EmbedHelpers.createEmptyEmbed("Nenhum dado encontrado!", interaction);
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

    const message = await interaction.editReply({
      embeds: [initialEmbed],
      components: totalPages > 1 ? [getRow(currentPage)] : [],
    });

    if (totalPages <= 1) return;

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000, // 5 minutos
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "Apenas quem usou o comando pode navegar!", ephemeral: true });
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

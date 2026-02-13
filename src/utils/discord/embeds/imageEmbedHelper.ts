import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { ImageResponse } from "../../../services/imageService.js";
import { EmbedHelpers } from "./embedHelpers.js";
import { PaginationHelper } from "./paginationHelper.js";
import { Translator } from "../../../types/Command.js";

export class ImageEmbedHelper {
  static async createSingleImageEmbed(
    interaction: ChatInputCommandInteraction,
    image: ImageResponse,
    t: Translator,
    extraInfo?: string,
  ): Promise<void> {
    const embed = this.createImageEmbed(interaction, image, 0, 1, t, extraInfo);

    await interaction.editReply({ embeds: [embed] });
  }

  static async createPaginatedImageEmbed(
    interaction: ChatInputCommandInteraction,
    images: ImageResponse[],
    t: Translator,
  ) {
    await PaginationHelper.createPagination(
      interaction,
      images,
      (currentItems, page, total) => {
        return this.createImageEmbed(interaction, currentItems[0], page, total, t);
      },
      1, //1 image per page
      t,
    );
  }

  private static createImageEmbed(
    interaction: ChatInputCommandInteraction,
    image: ImageResponse,
    currentPage: number,
    totalPages: number,
    t: Translator,
    extraTextInfo?: string,
  ): EmbedBuilder {
    const category = image.category?.name || t("common.words.unknown");
    const authorName = image.addedBy?.username || t("common.words.unknown");

    const embed = EmbedHelpers.createEmbed({
      title: image.title || t("common.placeholders.no_title"),
      description: `*"${image.description || t("common.placeholders.no_description")}"*`,
      url: image.url,
      image: image.url,
      author: {
        name: t("commands.fun.list-images.author_text", { user: authorName }),
        iconURL: image.addedBy?.avatar,
      },
      color: "#80004f",
      footer: {
        text: t("commands.fun.list-images.footer_text", {
          category: category,
          user: authorName,
          date: image.addedAt.toLocaleDateString(interaction.locale),
          current: currentPage + 1,
          total: totalPages,
        }),
        iconURL: interaction.guild?.iconURL() || undefined,
      },
    });

    if (extraTextInfo) {
      embed.addFields({
        name: t("commands.fun.list-images.extra_info"),
        value: extraTextInfo,
      });
    }

    if (image.tags) {
      const tagsArray = image.tags.split(",").map((tag) => `\`${tag.trim()}\``);
      embed.addFields({
        name: " ",
        value: tagsArray.join(" ") || " ",
      });
    }

    return embed;
  }
}

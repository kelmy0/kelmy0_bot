import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { CategoryResponse } from "../../../services/categoryService.js";
import { EmbedHelpers } from "./embedHelpers.js";
import { PaginationHelper } from "./paginationHelper.js";
import { Translator } from "../../../types/Command.js";

export class CategoryEmbedHelper {
  static async createPaginatedCategoryembed(
    interaction: ChatInputCommandInteraction,
    categories: CategoryResponse[],
    t: Translator,
  ) {
    await PaginationHelper.createPagination(
      interaction,
      categories,
      (currentItems, page, total) => {
        return this.createCategoryEmbed(interaction, currentItems, page, total, categories.length, t);
      },
      20, //20 categories per page
      t,
    );
  }

  private static createCategoryEmbed(
    interaction: ChatInputCommandInteraction,
    categories: CategoryResponse[],
    currentPage: number,
    totalPages: number,
    totalCategories: number,
    t: Translator,
  ): EmbedBuilder {
    const embed = EmbedHelpers.createEmbed({
      title: t("commands.utility.list-images-categories.title"),
      color: "#0f178d",
      thumbnail: interaction.guild?.iconURL() ?? interaction.client.user.displayAvatarURL(),
      description: t("commands.utility.list-images-categories.description", { total: totalCategories }),
      footer: {
        text: t("commands.utility.list-images-categories.footer_text", {
          currentPage: currentPage + 1,
          totalPages: totalPages,
        }),
        iconURL: interaction.client.user.displayAvatarURL(),
      },
      timestamp: true,
    });

    const categoryList = categories
      .map((cat) => {
        return t("commands.utility.list-images-categories.list", { name: cat.name });
      })
      .join("\n");

    embed.addFields({
      name: t("commands.utility.list-images-categories.field_name"),
      value: categoryList || t("common.placeholders.no_data"),
    });

    return embed;
  }
}

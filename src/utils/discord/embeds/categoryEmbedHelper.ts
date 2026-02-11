import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { CategoryResponse } from "../../../services/categoryService.js";
import { EmbedHelpers } from "./embedHelpers.js";
import { PaginationHelper } from "./paginationHelper.js";

export class CategoryEmbedHelper {
  static async createPaginatedCategoryembed(
    interaction: ChatInputCommandInteraction,
    categories: CategoryResponse[],
  ) {
    await PaginationHelper.createPagination(
      interaction,
      categories,
      (currentItems, page, total) => {
        return this.createCategoryEmbed(interaction, currentItems, page, total, categories.length);
      },
      10, //10 categorias por pagina
    );
  }

  private static createCategoryEmbed(
    interaction: ChatInputCommandInteraction,
    categories: CategoryResponse[],
    currentPage: number,
    totalPages: number,
    totalCategories: number,
  ): EmbedBuilder {
    const embed = EmbedHelpers.createEmbed({
      title: "📚 **CATEGORIAS DISPONÍVEIS**",
      color: "#0f178d",
      thumbnail: `${interaction.guild?.iconURL() || "https://cdn.discordapp.com/embed/avatars/0.png"}`,
      description: `**Total:** ${totalCategories} categorias\nSelecione uma categoria para ver as imagens:`,
      footer: {
        text: `Página ${currentPage + 1}/${totalPages} • Use /list-images categoria <nome>`,
        iconURL: interaction.client.user?.displayAvatarURL(),
      },
      timestamp: true,
    });

    const categoryList = categories
      .map((cat) => {
        return `**${cat.name}** • X imagens`;
      })
      .join("\n");

    embed.addFields({
      name: "📂 **Lista de Categorias**",
      value: categoryList || "Nenhuma categoria encontrada",
    });

    return embed;
  }
}

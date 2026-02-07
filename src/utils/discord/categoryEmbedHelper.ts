import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { CategoryResponse } from "../../services/categoryService.js";
import { EmbedHelpers } from "./embedHelpers.js";

export class CategoryEmbedHelper {
  static async createPaginatedCategoryembed(
    interaction: ChatInputCommandInteraction,
    categories: CategoryResponse[],
  ) {
    if (categories.length === 0) {
      EmbedHelpers.createEmptyEmbed("Nenhuma Categoria Encontrada!", interaction);
      return;
    }

    let currentPage = 0;
    const itemsPerPage = 10;
    const totalPages = Math.ceil(categories.length / itemsPerPage);

    //primeiro embed
    const embed = this.createCategoryEmbed(interaction, categories, currentPage, totalPages);

    await interaction.editReply({ embeds: [embed] });
  }

  private static createCategoryEmbed(
    interaction: ChatInputCommandInteraction,
    categories: CategoryResponse[],
    currentPage: number,
    totalPages: number,
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle("📚 **CATEGORIAS DISPONÍVEIS**")
      .setColor("#0f178d")
      .setThumbnail(
        interaction.guild?.iconURL() || "https://cdn.discordapp.com/embed/avatars/0.png",
      )
      .setDescription(
        `**Total:** ${categories.length} categorias\nSelecione uma categoria para ver as imagens:`,
      )
      .setFooter({
        text: `Página ${currentPage + 1}/${totalPages} • Use /list-images categoria <nome>`,
        iconURL: interaction.client.user?.displayAvatarURL(),
      })
      .setTimestamp();

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

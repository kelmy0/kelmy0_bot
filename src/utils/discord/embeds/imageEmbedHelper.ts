import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { ImageResponse } from "../../../services/imageService.js";
import { EmbedHelpers } from "./embedHelpers.js";
import { PaginationHelper } from "./paginationHelper.js";

export class ImageEmbedHelper {
  static async createSingleImageEmbed(
    interaction: ChatInputCommandInteraction,
    image: ImageResponse,
    extraInfo?: string,
  ): Promise<void> {
    const embed = this.createImageEmbed(interaction, image, 0, 1, extraInfo);

    await interaction.editReply({ embeds: [embed] });
  }

  static async createPaginatedImageEmbed(interaction: ChatInputCommandInteraction, images: ImageResponse[]) {
    await PaginationHelper.createPagination(
      interaction,
      images,
      (currentItems, page, total) => {
        return this.createImageEmbed(interaction, currentItems[0], page, total);
      },
      1, //1 imagem por pagina
    );
  }

  private static createImageEmbed(
    interaction: ChatInputCommandInteraction,
    image: ImageResponse,
    currentPage: number,
    totalPages: number,
    extraTextInfo?: string,
  ): EmbedBuilder {
    const embed = EmbedHelpers.createEmbed({
      title: `${image.title || "Imagem"}`,
      description: `*"${image.description || "sem descrição"}"*`,
      url: image.url,
      image: image.url,
      author: {
        name: `📤 Enviado por ${image.addedBy?.username}`,
        iconURL: `${image.addedBy?.avatar || "https://cdn.discordapp.com/embed/avatars/2.png"}`,
      },
      color: "#80004f",
      footer: {
        text: `${image.category?.name} • Por ${image.addedBy?.username} • ${image.addedAt.toLocaleDateString("pt-BR")} • ${currentPage + 1} de ${totalPages}`,
        iconURL: interaction.guild?.iconURL() || undefined,
      },
    });

    if (extraTextInfo) {
      embed.addFields({
        name: "Informação extra:",
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

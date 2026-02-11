import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import { ImageResponse } from "../../services/imageService.js";
import { EmbedHelpers } from "./embedHelpers.js";

export class ImageEmbedHelper {
  static async createSingleImageEmbed(
    interaction: ChatInputCommandInteraction,
    image: ImageResponse,
    extraInfo?: string,
  ): Promise<void> {
    const embed = this.createImageEmbed(interaction, image, 0, 1, extraInfo);

    await interaction.editReply({ embeds: [embed] });
  }

  static async createPaginatedImageEmbed(
    interaction: ChatInputCommandInteraction,
    images: ImageResponse[],
  ) {
    if (images.length === 0) {
      EmbedHelpers.createEmptyEmbed("Nenhuma imagem encontrada!", interaction);
      return;
    }

    //Pagina atual do embed
    let currentPage = 0;
    const totalPages = images.length; //todas as paginas

    // Primeiro embed
    const embed = this.createImageEmbed(interaction, images[currentPage], currentPage, totalPages);

    // Cria os botoes
    const buttons = this.createImageEmbedButtons(currentPage, totalPages);

    // Envia a mensagem inicial
    const message = await interaction.editReply({
      embeds: [embed],
      components: [buttons],
    });

    // Captura os cliques
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000 * 5, //5 minutos de timeout
    });

    collector.on("collect", async (buttonInteraction) => {
      if (buttonInteraction.user.id !== interaction.user.id) {
        return buttonInteraction.reply({
          content: "Apenas quem usou o comando pode navegar!",
          ephemeral: true,
        });
      }

      // Atualiza a página baseada no botão clicado
      switch (buttonInteraction.customId) {
        case "first":
          currentPage = 0;
          break;
        case "prev":
          currentPage = Math.max(0, currentPage - 1);
          break;
        case "next":
          currentPage = Math.min(totalPages - 1, currentPage + 1);
          break;
        case "last":
          currentPage = totalPages - 1;
          break;
      }

      // Atualiza a mensagem e o embed
      const updatedEmbed = this.createImageEmbed(
        interaction,
        images[currentPage],
        currentPage,
        totalPages,
      );
      const updatedButtons = this.createImageEmbedButtons(currentPage, totalPages);

      await buttonInteraction.update({
        embeds: [updatedEmbed],
        components: [updatedButtons],
      });
    });

    collector.on("end", () => {
      message
        .edit({
          components: [],
        })
        .catch(() => {});
    });
  }

  private static createImageEmbed(
    interaction: ChatInputCommandInteraction,
    image: ImageResponse,
    currentPage: number,
    totalPages: number,
    extraTextInfo?: string,
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`${image.title || "Imagem"}`)
      .setURL(image.url)
      .setImage(image.url)
      //.setThumbnail("https://i.imgur.com/fVhQ89Q.png") // aqui vai ser a url da categoria
      .setAuthor({
        name: `📤 Enviado por ${image.addedBy?.username}`,
        iconURL: `${image.addedBy?.avatar || "https://cdn.discordapp.com/embed/avatars/" + (Number(image.addedById) % 5) + ".png"}`,
      })
      .setColor("#80004f")
      .setFooter({
        text: `${image.category?.name} • Por ${image.addedBy?.username} • ${image.addedAt.toLocaleDateString("pt-BR")} • ${currentPage + 1} de ${totalPages}`,
        iconURL: interaction.guild?.iconURL() || undefined, // Ícone minimalista
      });

    if (image.description) {
      embed.setDescription(`*"${image.description}"*`);
    }

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

  private static createEmptyEmbed(text: string): EmbedBuilder {
    return new EmbedBuilder().setTitle(text).setColor("#0566b4");
  }

  private static createImageEmbedButtons(
    currentPage: number,
    totalPages: number,
  ): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("first")
        .setLabel("⏪")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("◀️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId("page")
        .setLabel(`${currentPage + 1}/${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("▶️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === totalPages - 1),
      new ButtonBuilder()
        .setCustomId("last")
        .setLabel("⏩")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === totalPages - 1),
    );
  }
}

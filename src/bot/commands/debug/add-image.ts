import { PermissionFlagsBits, SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { Command, Translator } from "../../../types/index.js";
import ImageService from "../../../services/imageService.js";
import {
  requirePrisma,
  handleCommandError,
  getOrRegisterUser,
  handleServiceResponse,
} from "../../../utils/index.js";

export default {
  data: new SlashCommandBuilder()
    .setName("add-image")
    .setNameLocalizations({ "pt-BR": "adicionar-imagem" })
    .setDescription("Send image URL to development environment database")
    .setDescriptionLocalizations({
      "pt-BR": "Envia URL de imagem ao banco de dados do ambiente de desenvolvimento",
    })
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Image URL")
        .setDescriptionLocalizations({ "pt-BR": "URL da imagem" })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setNameLocalizations({ "pt-BR": "titulo" })
        .setDescription("Image title")
        .setDescriptionLocalizations({ "pt-BR": "Titulo da imagem" })
        .setRequired(true)
        .setMaxLength(50),
    )
    .addStringOption((option) =>
      option
        .setName("category")
        .setNameLocalizations({ "pt-BR": "categoria" })
        .setDescription("Image category")
        .setDescriptionLocalizations({ "pt-BR": "Categoria da imagem" })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("tags")
        .setDescription("Tags to identify the image, separated by commas")
        .setDescriptionLocalizations({ "pt-BR": "Tags para identificar a imagem, separe por virgulas" })
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setNameLocalizations({ "pt-BR": "descricao" })
        .setDescription("Image description")
        .setDescriptionLocalizations({ "pt-BR": "Descrição da imagem" })
        .setMaxLength(255)
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  metadata: {
    category: "debug",
    production: false,
  },

  async execute(interaction: ChatInputCommandInteraction, t: Translator, prisma?: PrismaClient) {
    await interaction.deferReply();

    const rawUrl = interaction.options.getString("url", true);
    const rawCategory = interaction.options.getString("category", true);
    const rawTags = interaction.options.getString("tags");
    const rawTitle = interaction.options.getString("title", true);
    const rawDescription = interaction.options.getString("description");

    try {
      const db = requirePrisma(prisma);
      const imageService = new ImageService(db);

      const user = await getOrRegisterUser(db, interaction);

      const result = await imageService.addImageUrl(
        {
          url: rawUrl,
          title: rawTitle,
          description: rawDescription,
          tags: rawTags,
          category: rawCategory,
          addedById: user.id,
        },
        t,
      );

      await handleServiceResponse(interaction, result);
    } catch (error) {
      await handleCommandError(interaction, "add-image", error, t);
    }
  },
} satisfies Command;

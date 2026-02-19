import { PrismaClient } from "@prisma/client";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, Translator } from "../../../types/index.js";
import {
  getOrRegisterUser,
  handleCommandError,
  handleServiceResponse,
  requirePrisma,
} from "../../../utils/index.js";
import CategoryService from "../../../services/categoryService.js";

export default {
  data: new SlashCommandBuilder()
    .setName("delete-image-category")
    .setNameLocalizations({ "pt-BR": "deletar-categoria-imagem" })

    .setDescription("Delete a category for images from develop environment")
    .setDescriptionLocalizations({
      "pt-BR": "Delete uma categoria para as imagens no ambiente de desenvolvimento",
    })
    .addStringOption((option) =>
      option
        .setName("category")
        .setNameLocalizations({ "pt-BR": "categoria" })

        .setDescription("Category name")
        .setDescriptionLocalizations({ "pt-BR": "Nome da categoria" })
        .setMaxLength(50)
        .setRequired(true),
    ),

  metadata: {
    production: false,
    category: "debug",
  },

  async execute(interaction: ChatInputCommandInteraction, t: Translator, prisma?: PrismaClient) {
    await interaction.deferReply();

    const category = interaction.options.getString("category", true);

    try {
      const db = requirePrisma(prisma);
      const categoryService = new CategoryService(db);

      await getOrRegisterUser(db, interaction);

      const result = await categoryService.deleteCategory(category);

      await handleServiceResponse(interaction, result);
    } catch (error) {
      await handleCommandError(interaction, "delete-image-category", error, t);
    }
  },
} satisfies Command;

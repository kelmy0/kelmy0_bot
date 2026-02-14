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
    .setName("add-image-category")
    .setNameLocalizations({ "pt-BR": "adicionar-categoria-imagem" })

    .setDescription("Add a category for images in develop environment")
    .setDescriptionLocalizations({
      "pt-BR": "Adicione uma categoria para as imagens no ambiente de desenvolvimento",
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
      const service = new CategoryService(db);

      const user = await getOrRegisterUser(db, interaction);

      const result = await service.addCategory(category, user.id);

      await handleServiceResponse(interaction, result);
    } catch (error) {
      await handleCommandError(interaction, "add-image-category", error, t);
    }
  },
} satisfies Command;

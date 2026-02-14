import { PrismaClient } from "@prisma/client";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, Translator } from "../../../types/index.js";
import {
  CategoryEmbedHelper,
  handleCommandError,
  handleServiceResponse,
  requirePrisma,
} from "../../../utils/index.js";
import CategoryService from "../../../services/categoryService.js";

export default {
  data: new SlashCommandBuilder()
    .setName("list-images-categories")
    .setDescription("List all categories of images")

    .setNameLocalization("pt-BR", "listar-categorias-imagens")
    .setDescriptionLocalization("pt-BR", "Listar todas as categorías das imagens")

    .addStringOption((option) =>
      option
        .setName("order-by")
        .setNameLocalization("pt-BR", "ordem-de-busca")

        .setDescription("Order categories by creation date")
        .setDescriptionLocalization("pt-BR", "Ordenar categorias pela data de criação")

        .addChoices(
          { name: "newer-older", value: "desc", name_localizations: { "pt-BR": "novo-antigo" } },
          { name: "older-newer", value: "asc", name_localizations: { "pt-BR": "antigo-novo" } },
        ),
    )
    .addIntegerOption((option) =>
      option
        .setName("limit")
        .setNameLocalization("pt-BR", "limite")
        .setDescription("Query limit")
        .setDescriptionLocalization("pt-BR", "Limite de busca")
        .setMinValue(1)
        .setMaxValue(50),
    ),

  metadata: {
    production: true,
    category: "utility",
  },

  async execute(interaction: ChatInputCommandInteraction, t: Translator, prisma?: PrismaClient) {
    await interaction.deferReply();

    const orderBy = interaction.options.getString("order-by") ?? "desc";
    const limit = interaction.options.getInteger("limit") ?? 20;

    try {
      const db = requirePrisma(prisma);
      const service = new CategoryService(db);

      const result = await service.listCategories({ orderBy: orderBy, limit }, t);

      if (!result.success || !result.data) {
        await handleServiceResponse(interaction, result);
        return;
      }

      await CategoryEmbedHelper.createPaginatedCategoryembed(interaction, result.data, t);
    } catch (error) {
      await handleCommandError(interaction, "list-images-categories", error, t);
    }
  },
} satisfies Command;

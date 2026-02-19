import { PrismaClient } from "@prisma/client";
import { ApplicationIntegrationType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, Translator } from "../../../types/index.js";
import {
  CategoryEmbedHelper,
  executeWithCache,
  handleCommandError,
  handleServiceResponse,
  requirePrisma,
} from "../../../utils/index.js";
import CategoryService, { CategoryResponse } from "../../../services/categoryService.js";
import cache from "../../../lib/cache.js";

export default {
  data: new SlashCommandBuilder()
    .setName("list-images-categories")
    .setDescription("List all categories of images")

    .setNameLocalizations({ "pt-BR": "listar-categorias-imagens" })
    .setDescriptionLocalizations({ "pt-BR": "Listar todas as categorías das imagens" })

    .addStringOption((option) =>
      option
        .setName("order-by")
        .setNameLocalizations({ "pt-BR": "ordem-de-busca" })

        .setDescription("Order categories by creation date")
        .setDescriptionLocalizations({ "pt-BR": "Ordenar categorias pela data de criação" })

        .addChoices(
          { name: "newer-older", value: "desc", name_localizations: { "pt-BR": "novo-antigo" } },
          { name: "older-newer", value: "asc", name_localizations: { "pt-BR": "antigo-novo" } },
        ),
    )
    .addIntegerOption((option) =>
      option
        .setName("limit")
        .setNameLocalizations({ "pt-BR": "limite" })
        .setDescription("Query limit")
        .setDescriptionLocalizations({ "pt-BR": "Limite de busca" })
        .setMinValue(1)
        .setMaxValue(50),
    )
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall),

  metadata: {
    production: true,
    category: "info",
    cooldown: 5,
  },

  async execute(interaction: ChatInputCommandInteraction, t: Translator, prisma?: PrismaClient) {
    const orderBy = interaction.options.getString("order-by");
    const limit = interaction.options.getInteger("limit");

    const isDefaultQuery = !limit && !orderBy;
    const db = requirePrisma(prisma);
    const categoryService = new CategoryService(db);

    await executeWithCache({
      interaction: interaction,
      cacheKey: isDefaultQuery ? "img:list:categories:default" : null,
      executeService: () => categoryService.listCategories({ orderBy: orderBy, limit: limit }, t),
      renderSuccess: (data) => CategoryEmbedHelper.createPaginatedCategoryembed(interaction, data, t),
      handleError: (err) => handleCommandError(interaction, "list-images-categories", err, t),
    });
  },
} satisfies Command;

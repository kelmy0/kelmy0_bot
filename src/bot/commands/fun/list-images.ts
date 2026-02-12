import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, Translator } from "../../../types/Command.js";
import { handleCommandError } from "../../../utils/discord/commandHelpers.js";
import { PrismaClient } from "@prisma/client";
import { requirePrisma } from "../../../utils/prisma/prismaRequire.js";
import ImageService from "../../../services/imageService.js";
import { handleServiceResponse } from "../../../utils/discord/responseHandler.js";
import { ImageEmbedHelper } from "../../../utils/discord/embeds/imageEmbedHelper.js";

export default {
  data: new SlashCommandBuilder()
    .setName("list-images")
    .setNameLocalization("pt-BR", "listar-imagens")

    .setDescription("List random images")
    .setDescriptionLocalization("pt-BR", "Lista imagens aleatorias")

    .addStringOption((option) =>
      option
        .setName("category")
        .setNameLocalization("pt-BR", "categoria")
        .setDescription("Search in a specific category")
        .setDescriptionLocalization("pt-BR", "Busca em uma categoria específica"),
    )
    .addStringOption((option) =>
      option
        .setName("orderby")
        .setNameLocalization("pt-BR", "ordem")

        .setDescription("Search order")
        .setDescriptionLocalization("pt-BR", "Ordem de busca")

        .addChoices(
          { name: "Older-Newer", name_localizations: { "pt-BR": "Antigo-novo" }, value: "asc" },
          { name: "Newer-older", name_localizations: { "pt-BR": "Novo-antigo" }, value: "desc" },
        ),
    )
    .addIntegerOption((option) =>
      option
        .setName("limit")
        .setNameLocalization("pt-BR", "limite")

        .setDescription("Amount of images")
        .setDescriptionLocalization("pt-BR", "Quantidade de imagens")

        .setMinValue(1)
        .setMaxValue(20),
    ),

  metadata: {
    production: true,
    category: "fun",
  },

  async execute(interaction: ChatInputCommandInteraction, t: Translator, prisma?: PrismaClient) {
    await interaction.deferReply();
    const rawCategory = interaction.options.getString("category");
    const limit = interaction.options.getInteger("limit") || 10;
    const rawOrderby = interaction.options.getString("orderby");
    const db = requirePrisma(prisma);
    const imageService = new ImageService(db);

    try {
      const orderBy = (rawOrderby && rawOrderby === "asc") || rawOrderby === "desc" ? rawOrderby : "desc";

      const result = await imageService.listImages({
        category: rawCategory || null,
        limit: limit,
        orderBy: orderBy,
      });

      if (!result.success || !result.data) {
        await handleServiceResponse(interaction, result);
        return;
      }

      ImageEmbedHelper.createPaginatedImageEmbed(interaction, result.data, t);
    } catch (error) {
      await handleCommandError(interaction, "list-images", error);
    }
  },
} satisfies Command;

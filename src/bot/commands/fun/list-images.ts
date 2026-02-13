import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, Translator } from "../../../types/Command.js";
import { PrismaClient } from "@prisma/client";
import ImageService from "../../../services/imageService.js";
import {
  ImageEmbedHelper,
  handleServiceResponse,
  requirePrisma,
  handleCommandError,
} from "../../../utils/index.js";

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
    const category = interaction.options.getString("category");
    const limit = interaction.options.getInteger("limit") ?? 10;
    const orderBy = interaction.options.getString("orderby") ?? "desc";
    const db = requirePrisma(prisma);
    const imageService = new ImageService(db);

    try {
      const result = await imageService.listImages({
        category: category,
        limit: limit,
        orderBy: orderBy,
      });

      if (!result.success || !result.data) {
        await handleServiceResponse(interaction, result);
        return;
      }

      ImageEmbedHelper.createPaginatedImageEmbed(interaction, result.data, t);
    } catch (error) {
      await handleCommandError(interaction, "list-images", error, t);
    }
  },
} satisfies Command;

import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../types/Command.js";
import { handleCommandError } from "../../../utils/discord/commandHelpers.js";
import { PrismaClient } from "../../../generated/prisma/client.js";
import { requirePrisma } from "../../../utils/prisma/prismaRequire.js";
import ImageService from "../../../services/imageService.js";
import { handleServiceResponse } from "../../../utils/discord/responseHandler.js";
import { imageEmbedHelper } from "../../../utils/discord/imageEmbedHelper.js";

export default {
  data: new SlashCommandBuilder()
    .setName("list-images")
    .setDescription("Lista imagens aleatorias")
    .addStringOption((option) =>
      option.setName("categoria").setDescription("Buscar em uma categoria específica"),
    )
    .addStringOption((option) =>
      option
        .setName("orderby")
        .setDescription("Qual a ordem de exibição")
        .addChoices({ name: "Crescente", value: "asc" }, { name: "Decrescente", value: "desc" }),
    )
    .addIntegerOption((option) =>
      option
        .setName("limit")
        .setDescription("Quantidade de imagens")
        .setMinValue(1)
        .setMaxValue(20),
    ),

  metadata: {
    production: true,
    category: "fun",
  },

  async execute(interaction: ChatInputCommandInteraction, prisma?: PrismaClient) {
    await interaction.deferReply();
    const rawCategory = interaction.options.getString("categoria");
    const limit = interaction.options.getInteger("limit") || 10;
    const rawOrderby = interaction.options.getString("orderby");
    const db = requirePrisma(prisma);
    const imageService = new ImageService(db);

    try {
      const orderBy =
        (rawOrderby && rawOrderby === "asc") || rawOrderby === "desc" ? rawOrderby : "desc";

      const result = await imageService.listImages({
        category: rawCategory || null,
        limit: limit,
        orderBy: orderBy,
      });

      if (!result.success || !result.data) {
        await handleServiceResponse(interaction, result);
        return;
      }

      imageEmbedHelper.createPaginatedImageEmbed(interaction, result.data);
    } catch (error) {
      await handleCommandError(interaction, "list-images", error);
    }
  },
} satisfies Command;

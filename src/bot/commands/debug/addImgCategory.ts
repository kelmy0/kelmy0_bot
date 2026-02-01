import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../types/Command.js";
import { PrismaClient } from "../../../generated/prisma/client.js";
import ImageService from "../../services/imageService.js";
import { requirePrisma } from "../../../utils/prisma.js";

export default {
  data: new SlashCommandBuilder()
    .setName("add-image-category")
    .setDescription("Adiciona uma nova categoria a imagens (debug)")
    .addStringOption((options) =>
      options
        .setName("Categoria")
        .setDescription("Nome da categoria")
        .setRequired(true),
    ),
  metadata: { category: "debug", production: false },
  async execute(
    interaction: ChatInputCommandInteraction,
    prisma?: PrismaClient,
  ) {
    const imgService = new ImageService(requirePrisma(prisma));
  },
} satisfies Command;

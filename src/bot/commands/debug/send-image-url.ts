import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { PrismaClient } from "../../../generated/prisma/client.js";
import { Command } from "../../../types/Command.js";
import { requirePrisma } from "../../../utils/prisma/prismaRequire.js";
import ImageService from "../../../services/imageService.js";
import { handleCommandError } from "../../../utils/discord/commandHelpers.js";
import { getOrRegisterUser } from "../../../utils/services/userHelper.js";
import { handleServiceResponse } from "../../../utils/discord/responseHandler.js";

export default {
  data: new SlashCommandBuilder()
    .setName("send-image-url")
    .setDescription(
      "Envia URL de uma imagem ao banco de dados do ambiente de desenvolvimento",
    )
    .addStringOption((option) =>
      option.setName("url").setDescription("Url da imagem").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("categoria")
        .setDescription("categoria da imagem")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("tags")
        .setDescription("Tags separadas por vírgula, use _ para espaços")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Um titulo para a imagem")
        .setRequired(false)
        .setMaxLength(50),
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Uma descricao breve para a imagem")
        .setMaxLength(255)
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  metadata: {
    category: "debug",
    production: false,
  },

  async execute(
    interaction: ChatInputCommandInteraction,
    prisma?: PrismaClient,
  ) {
    await interaction.deferReply();

    const rawUrl = interaction.options.getString("url", true);
    const rawCategory = interaction.options.getString("categoria", true);
    const rawTags = interaction.options.getString("tags");
    const rawTitle = interaction.options.getString("title");
    const rawDescription = interaction.options.getString("description");

    const db = requirePrisma(prisma);
    const imageService = new ImageService(db);

    try {
      const userId = await getOrRegisterUser(db, interaction);

      const result = await imageService.addImageUrl({
        url: rawUrl,
        title: rawTitle,
        description: rawDescription,
        tags: rawTags,
        category: rawCategory,
        addedById: userId,
      });
      await handleServiceResponse(interaction, result);
    } catch (error) {
      await handleCommandError(interaction, "send-image-url", error);
    }
  },
} satisfies Command;

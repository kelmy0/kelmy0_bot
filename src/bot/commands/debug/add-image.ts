import { PermissionFlagsBits, SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { Command } from "../../../types/Command.js";
import { requirePrisma } from "../../../utils/prisma/prismaRequire.js";
import ImageService from "../../../services/imageService.js";
import { handleCommandError } from "../../../utils/discord/commandHelpers.js";
import { getOrRegisterUser } from "../../../utils/services/userHelper.js";
import { handleServiceResponse } from "../../../utils/discord/responseHandler.js";
import { Translator } from "../../../types/Command.js";

export default {
  data: new SlashCommandBuilder()
    .setName("add-image")
    .setDescription("Envia URL de uma imagem ao banco de dados do ambiente de desenvolvimento")
    .addStringOption((option) => option.setName("url").setDescription("Url da imagem").setRequired(true))
    .addStringOption((option) =>
      option.setName("title").setDescription("Um titulo para a imagem").setRequired(true).setMaxLength(50),
    )
    .addStringOption((option) =>
      option.setName("category").setDescription("categoria da imagem").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("tags").setDescription("Tags separadas por vírgula").setRequired(false),
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

  async execute(interaction: ChatInputCommandInteraction, t: Translator, prisma?: PrismaClient) {
    await interaction.deferReply();

    const rawUrl = interaction.options.getString("url", true);
    const rawCategory = interaction.options.getString("category", true);
    const rawTags = interaction.options.getString("tags");
    const rawTitle = interaction.options.getString("title", true);
    const rawDescription = interaction.options.getString("description");

    const db = requirePrisma(prisma);
    const imageService = new ImageService(db);

    try {
      const user = await getOrRegisterUser(db, interaction);

      const result = await imageService.addImageUrl({
        url: rawUrl,
        title: rawTitle,
        description: rawDescription,
        tags: rawTags,
        category: rawCategory,
        addedById: user.id,
      });

      await handleServiceResponse(interaction, result);
    } catch (error) {
      await handleCommandError(interaction, "add-image", error);
    }
  },
} satisfies Command;

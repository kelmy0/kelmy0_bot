import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command, Translator } from "../../../types/Command.js";
import { PrismaClient } from "@prisma/client";
import ImageService from "../../../services/imageService.js";
import { requirePrisma } from "../../../utils/prisma/prismaRequire.js";
import { handleCommandError } from "../../../utils/discord/commandHelpers.js";
import { getOrRegisterUser } from "../../../utils/services/userHelper.js";
import { handleServiceResponse } from "../../../utils/discord/responseHandler.js";
import { ImageEmbedHelper } from "../../../utils/discord/embeds/imageEmbedHelper.js";

export default {
  data: new SlashCommandBuilder()
    .setName("delete-image")
    .setNameLocalization("pt-BR", "deletar-imagem")
    .setDescription("Delete image by id or URL")
    .setDescriptionLocalization("pt-BR", "Deletar imagem pelo id ou URL")
    .addStringOption((option) =>
      option
        .setName("id-or-url")
        .setNameLocalization("pt-BR", "id-ou-url")
        .setDescription("Enter the image ID or URL")
        .setDescriptionLocalization("pt-BR", "Insira o ID ou URL da imagem")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  metadata: {
    category: "debug",
    production: false,
  },

  async execute(
    interaction: ChatInputCommandInteraction,
    t: Translator,
    prisma?: PrismaClient,
  ): Promise<void> {
    await interaction.deferReply();
    const idOrUrl = interaction.options.getString("id-or-url", true);
    const db = requirePrisma(prisma);
    const imageService = new ImageService(db);

    try {
      const user = await getOrRegisterUser(db, interaction);

      const result = await imageService.deleteImage(idOrUrl);
      if (!result.success || !result.data) {
        await handleServiceResponse(interaction, result);
        return;
      }

      ImageEmbedHelper.createSingleImageEmbed(
        interaction,
        result.data,
        t,
        "🚫 Deleted per: " + user.username,
      );
    } catch (error) {
      await handleCommandError(interaction, "delete-image", error);
    }
  },
} satisfies Command;

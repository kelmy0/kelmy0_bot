import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command, Translator } from "../../../types/Command.js";
import { PrismaClient } from "@prisma/client";
import ImageService from "../../../services/imageService.js";
import {
  requirePrisma,
  handleCommandError,
  getOrRegisterUser,
  handleServiceResponse,
  ImageEmbedHelper,
} from "../../../utils/index.js";
import cache from "../../../lib/cache.js";

export default {
  data: new SlashCommandBuilder()
    .setName("delete-image")
    .setNameLocalizations({ "pt-BR": "deletar-imagem" })
    .setDescription("Delete image by id or URL")
    .setDescriptionLocalizations({ "pt-BR": "Deletar imagem pelo id ou URL" })
    .addStringOption((option) =>
      option
        .setName("id-or-url")
        .setNameLocalizations({ "pt-BR": "id-ou-url" })
        .setDescription("Enter the image ID or URL")
        .setDescriptionLocalizations({ "pt-BR": "Insira o ID ou URL da imagem" })
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

    try {
      const db = requirePrisma(prisma);
      const imageService = new ImageService(db);

      const user = await getOrRegisterUser(db, interaction);

      const result = await imageService.deleteImage(idOrUrl, t);

      if (!result.success || !result.data) {
        await handleServiceResponse(interaction, result);
        return;
      }

      cache.del("img:list:categories:default");
      ImageEmbedHelper.createSingleImageEmbed(
        interaction,
        result.data,
        t,
        t("commands.debug.delete-image.deleted_per", { user: user.username }),
      );
    } catch (error) {
      await handleCommandError(interaction, "delete-image", error, t);
    }
  },
} satisfies Command;

import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../types/Command.js";
import { PrismaClient } from "../../../../prisma/client/client.js";
import { requirePrisma } from "../../../utils/prisma/prismaRequire.js";
import { getOrRegisterUser } from "../../../utils/services/userHelper.js";
import { normalizeCategoryName } from "../../../utils/services/categoryHelper.js";
import { handleServiceResponse } from "../../../utils/discord/responseHandler.js";
import { handleCommandError } from "../../../utils/discord/commandHelpers.js";
import CategoryService from "../../../services/categoryService.js";
import { CategoryEmbedHelper } from "../../../utils/discord/categoryEmbedHelper.js";

export default {
  data: new SlashCommandBuilder()
    .setName("image-category")
    .setDescription("Gerenciar as categorias das imagens")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("selecione o que você quer gerenciar nas categorias")
        .addChoices(
          { name: "Listar categorias", value: "list" },
          { name: "Criar categoria", value: "create" },
          { name: "Deletar categoria", value: "delete" },
        )
        .setRequired(false),
    )
    .addStringOption((option) =>
      option.setName("name").setDescription("Nome da categoria").setRequired(false),
    )
    .addNumberOption((option) =>
      option
        .setName("limit")
        .setDescription("Limite de categorias para listar")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(50),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  metadata: { category: "debug", production: false },

  async execute(interaction: ChatInputCommandInteraction, prisma?: PrismaClient) {
    await interaction.deferReply();

    const action = interaction.options.getString("action") || "list";
    const rawName = interaction.options.getString("name");
    const limit = interaction.options.getNumber("limit");

    const db = requirePrisma(prisma);
    const categoryService = new CategoryService(db);

    try {
      const name = normalizeCategoryName(rawName);

      switch (action) {
        case "create": {
          if (!name) {
            await interaction.editReply("❌ Nome da categoria é obrigatório");
            return;
          }

          const userId = await getOrRegisterUser(db, interaction);
          const result = await categoryService.addCategory(name, userId);
          await handleServiceResponse(interaction, result);
          break;
        }

        case "delete": {
          if (!name) {
            await interaction.editReply("❌ Nome da categoria é obrigatório");
            return;
          }

          const result = await categoryService.deleteCategory(name);
          await handleServiceResponse(interaction, result);
          break;
        }

        case "list":
        default: {
          const result = await categoryService.listCategories({
            limit: limit || undefined,
          });

          if (!result.success || !result.data) {
            await handleServiceResponse(interaction, result);
            return;
          }

          console.log(result.data);

          CategoryEmbedHelper.createPaginatedCategoryembed(interaction, result.data);
          break;
        }
      }
    } catch (error) {
      await handleCommandError(interaction, `image-category ${action}`, error);
    }
  },
} satisfies Command;

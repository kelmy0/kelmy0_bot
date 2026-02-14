import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command, Translator } from "../../../types/Command.js";
import { PrismaClient } from "@prisma/client";
import CategoryService from "../../../services/categoryService.js";
import {
  CategoryEmbedHelper,
  handleCommandError,
  handleServiceResponse,
  normalizeCategoryName,
  getOrRegisterUser,
  requirePrisma,
} from "../../../utils/index.js";

export default {
  data: new SlashCommandBuilder()
    .setName("image-category-debug")
    .setNameLocalizations({ "pt-BR": "categoria-imagem-debug" })

    .setDescription("Managing image categories in development environment.")
    .setDescriptionLocalizations({ "pt-BR": "Gerenciar as categorias das imagens em ambiente de desenvolvimento" })

    .addStringOption((option) =>
      option
        .setName("action")
        .setNameLocalizations({ "pt-BR": "ação" })
        .setDescription("Select what you want to manage in the categories")
        .setDescriptionLocalizations({ "pt-BR": "Selecione o que você quer gerenciar nas categorias" })
        .addChoices(
          { name: "Create category", name_localizations: { "pt-BR": "Criar categoria" }, value: "create" },
          { name: "Delete category", name_localizations: { "pt-BR": "Deletar categoria" }, value: "delete" },
        )
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setNameLocalizations({ "pt-BR": "nome" })
        .setDescription("Category name")
        .setDescriptionLocalizations({ "pt-BR": "Nome da categoria" })
        .setRequired(false),
    )
    .addNumberOption((option) =>
      option
        .setName("limit")
        .setNameLocalizations({ "pt-BR": "limite" })
        .setDescription("Limit of number of categories listed")
        .setDescriptionLocalizations({ "pt-BR": "Limite do número de categorias listadas" })
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(50),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  metadata: { category: "debug", production: false },

  async execute(interaction: ChatInputCommandInteraction, t: Translator, prisma?: PrismaClient) {
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

          const user = await getOrRegisterUser(db, interaction);
          const result = await categoryService.addCategory(name, user.username);
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
      }
    } catch (error) {
      await handleCommandError(interaction, `image-category ${action}`, error, t);
    }
  },
} satisfies Command;

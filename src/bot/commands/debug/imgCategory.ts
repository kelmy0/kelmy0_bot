import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../types/Command.js";
import { PrismaClient } from "../../../generated/prisma/client.js";
import ImageService from "../../services/imageService.js";
import { requirePrisma } from "../../../utils/prisma.js";
import { getOrRegisterUser } from "../../../utils/userHelpers.js";
import { normalizeCategoryName } from "../../../utils/categoryHelper.js";

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
        ),
    )
    .addStringOption((option) =>
      option.setName("categoria").setDescription("Nome da categoria"),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  metadata: { category: "debug", production: false },
  async execute(
    interaction: ChatInputCommandInteraction,
    prisma?: PrismaClient,
  ) {
    await interaction.deferReply();
    const action = interaction.options.getString("action");
    switch (action) {
      case "create":
        const category = normalizeCategoryName(
          interaction.options.getString("categoria"),
        );
        if (!category) {
          await interaction.editReply(`Categoria não pode estar vazia!`);
          return;
        }

        try {
          const userId = await getOrRegisterUser(
            requirePrisma(prisma),
            interaction,
          );
          const rc = await registerCategory(
            requirePrisma(prisma),
            category,
            userId,
          );
          await interaction.editReply(
            `✅️ Categoria ${rc.name} registrada com sucesso por ${interaction.user.tag}`,
          );
        } catch (error) {
          await interaction.editReply(
            `❌ Falha crítica no registro: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
          );
          return;
        }
        break;

      case "list":
      default:
        const categorias = await listCategory(requirePrisma(prisma));
        await interaction.editReply(`Categorias: ${categorias}`);
    }
  },
} satisfies Command;

async function registerCategory(
  prisma: PrismaClient,
  name: string,
  userId: string,
) {
  const imageService = new ImageService(prisma);
  try {
    return await imageService.addCategory(name, userId);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    throw new Error(msg);
  }
}

async function listCategory(prisma: PrismaClient) {
  const imageService = new ImageService(prisma);
  try {
    return await imageService.listCategories();
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    throw new Error(msg);
  }
}

import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { PrismaClient } from "../../../generated/prisma/client.js";
import { Command } from "../../../types/Command.js";
import { requirePrisma } from "../../../utils/prisma/prismaRequire.js";

export default {
  data: new SlashCommandBuilder()
    .setName("send-img-url")
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
        .setRequired(true)
        .addChoices({
          name: "Miside",
          value: "miside",
        }),
    )
    .addStringOption((option) =>
      option
        .setName("tags")
        .setDescription("Tags separadas por vírgula")
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
    //const imgService = new ImageService(requirePrisma(prisma));
    const url = interaction.options.getString("url", true);
    const categoria = interaction.options.getString("categoria", true);
    const tags = interaction.options.getString("tags");

    await interaction.reply({
      content: `**Usuario:** ${interaction.user.tag}\n**URL:** ${url}\n**Categoria:** ${categoria}\n**tags:**${tags}`,
    });
  },
} satisfies Command;

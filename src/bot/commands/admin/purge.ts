import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { Command, Translator } from "../../../types/index.js";
import { handleCommandError } from "../../../utils/index.js";

export default {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setNameLocalizations({ "pt-BR": "limpar" })

    .setDescription("Delete messages in this channel.")
    .setDescriptionLocalizations({ "pt-BR": "Limpa mensagens nesse canal." })

    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setNameLocalizations({ "pt-BR": "quantidade" })

        .setDescription("Amount messages to clear.")
        .setDescriptionLocalizations({ "pt-BR": "Quantidade de mensagens para limpar." })
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall),
  metadata: {
    category: "admin",
    production: true,
  },
  async execute(interaction: ChatInputCommandInteraction, t: Translator) {
    try {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
        throw new Error(t("common.errors.no_permission"));
      }

      if (!interaction.channel || !("bulkDelete" in interaction.channel)) {
        throw new Error(t("common.errors.no_channel"));
      }

      const rawAmount = interaction.options.getInteger("amount", true);
      const amount = Math.min(100, Math.max(1, rawAmount));

      await interaction.deferReply({ flags: "Ephemeral" });

      await interaction.channel.bulkDelete(amount, true);
      await interaction.editReply("🧹✅");
    } catch (error) {
      await handleCommandError(interaction, "purge", error, t);
    }
  },
} satisfies Command;

import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { Command, Translator } from "../../../types/Command.js";
import { handleCommandError } from "../../../utils/index.js";

export default {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setNameLocalizations({ "pt-BR": "modo-lento" })
    .setDescription("Enable or disable slowmode. Set 0 to disable.")
    .setDescriptionLocalizations({ "pt-BR": "Ativa ou desativa o modo lento. Defina 0 para desativar." })
    .addIntegerOption((option) =>
      option
        .setName("seconds")
        .setNameLocalizations({ "pt-BR": "segundos" })
        .setDescription("Slowmode time.")
        .setDescriptionLocalizations({ "pt-BR": "Tempo do modo lento." })
        .setMinValue(0)
        .setMaxValue(21600),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall),

  metadata: {
    production: true,
    category: "admin",
  },

  async execute(interaction: ChatInputCommandInteraction, t: Translator) {
    const rawSeconds = interaction.options.getInteger("seconds") ?? 0;
    const seconds = Math.max(0, Math.min(rawSeconds, 21600));

    try {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
        throw new Error(t("common.errors.no_permission"));
      }

      if (!interaction.channel || !("setRateLimitPerUser" in interaction.channel)) {
        throw new Error(t("common.errors.no_channel"));
      }

      await interaction.channel.setRateLimitPerUser(seconds);

      await interaction.reply({ content: "✅", flags: "Ephemeral" });
    } catch (error) {
      await handleCommandError(interaction, "slowmode", error, t);
    }
  },
} satisfies Command;

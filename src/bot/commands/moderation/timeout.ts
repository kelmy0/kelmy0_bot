import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  User,
} from "discord.js";
import { Command, Translator } from "../../../types/index.js";
import { BanEmbedHelper, handleCommandError } from "../../../utils/index.js";

export default {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setNameLocalizations({ "pt-BR": "castigar" })
    .setDescription("Timeout a member.")
    .setDescriptionLocalizations({ "pt-BR": "Castiga um membro." })
    .addUserOption((option) =>
      option
        .setName("member")
        .setNameLocalizations({ "pt-BR": "membro" })
        .setDescription("Member to be punished.")
        .setDescriptionLocalizations({ "pt-BR": "Membro a ser punido." })
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("time")
        .setNameLocalizations({ "pt-BR": "tempo" })
        .setDescription("Time in minutes.")
        .setDescriptionLocalizations({ "pt-BR": "Tempo em minutos." })
        .setMinValue(1)
        .setMaxValue(10080)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setNameLocalizations({ "pt-BR": "motivo" })
        .setDescription("Timeout reason.")
        .setDescriptionLocalizations({ "pt-BR": "Motivo do castigo." })
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setContexts(InteractionContextType.Guild)
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall),

  metadata: {
    category: "moderation",
    production: true,
    cooldown: 1,
  },

  async execute(interaction: ChatInputCommandInteraction, t: Translator) {
    try {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
        throw new Error(t("common.errors.no_permission"));
      }

      if (!interaction.guild) {
        throw new Error(t("common.errors.no_guild"));
      }

      const memberTimeouted = interaction.options.getUser("member", true) as User;
      const rawTimeout = interaction.options.getInteger("time", true);
      const timeout = Math.min(10080, Math.max(1, rawTimeout)) * 60000;
      const reason = interaction.options.getString("reason", true);

      await interaction.deferReply({ flags: "Ephemeral" });

      const member = await interaction.guild.members.fetch(memberTimeouted.id).catch(() => null);
      if (!member) {
        throw new Error(t("common.errors.user_not_found"));
      }

      await BanEmbedHelper.createSingleBanEmbed(
        interaction,
        t("commands.moderation.timeout.title"),
        reason,
        member,
        t,
        true,
      );

      await member.timeout(timeout, reason);
    } catch (error) {
      await handleCommandError(interaction, "timeout", error, t);
    }
  },
} satisfies Command;

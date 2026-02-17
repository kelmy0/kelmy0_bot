import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../types/Command.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Reply pong!")
    .setDescriptionLocalizations({ "pt-BR": "Responde pong!" })
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall),

  metadata: {
    category: "utility",
    production: true,
  },
  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({ content: "⏳...", withResponse: true });
    if (!sent.resource || !sent.resource.message) {
      await interaction.editReply(`🏓 Pong! ${interaction.client.ws.ping}ms.`);
      return;
    }
    const realLatency = sent.resource.message.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`🏓 Pong! ${realLatency}ms.`);
  },
} satisfies Command;

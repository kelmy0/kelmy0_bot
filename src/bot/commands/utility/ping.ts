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
    cooldown: 2,
    silent: true,
  },
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply(`🏓 Pong! ${interaction.client.ws.ping}ms.`);
  },
} satisfies Command;

import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../types/Command.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Reply pong!")
    .setDescriptionLocalizations({ "pt-BR": "Responde pong!" }),

  metadata: {
    category: "utility",
    production: true,
  },
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply("Pong! " + interaction.client.ws.ping + "ms.");
  },
} satisfies Command;

import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";

const ping: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Responde com Pong!"),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply("Pong! " + interaction.client.ws.ping + "ms.");
  },
};

export default ping;

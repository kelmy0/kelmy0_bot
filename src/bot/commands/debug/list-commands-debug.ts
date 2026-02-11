import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../../../types/Command.js";
import { getCommands } from "../loader.js";

export default {
  data: new SlashCommandBuilder()
    .setName("list-commands-debug")
    .setDescription("Lista todos os comandos por categoria (DEBUG)"),

  async execute(interaction: ChatInputCommandInteraction) {
    const commands = await getCommands();

    const categories: Record<string, string[]> = {};

    for (const [name, cmd] of commands) {
      const category = cmd.metadata.category;
      if (!categories[category]) categories[category] = [];

      const prodFlag = cmd.metadata.production ? "✅" : "🚫";
      categories[category].push(`${prodFlag} **/${name}** - ${cmd.data.description}`);
    }

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("📋 Comandos Disponíveis")
      .setDescription(`Total: ${commands.size} comandos`);

    Object.entries(categories).forEach(([category, cmds]) => {
      embed.addFields({
        name: `${category.toUpperCase()} (${cmds.length})`,
        value: cmds.join("\n"),
        inline: false,
      });
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },

  metadata: {
    category: "debug",
    production: false,
    description: "Lista comandos por categoria",
  },
} satisfies Command;

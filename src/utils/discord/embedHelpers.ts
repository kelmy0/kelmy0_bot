import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export class EmbedHelpers {
  static async createEmptyEmbed(
    text: string,
    interaction?: ChatInputCommandInteraction,
  ): Promise<void | EmbedBuilder> {
    const embed = new EmbedBuilder().setTitle(text).setColor("#0566b4");
    if (interaction) {
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    return embed;
  }
}

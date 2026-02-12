import { ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from "discord.js";

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

  static createEmbed(options: EmbedInfo): EmbedBuilder {
    const embed = new EmbedBuilder().setTitle(options.title || "Sem titulo");

    if (options.description) embed.setDescription(options.description);

    if (options.color) embed.setColor(options.color);

    if (options.footer) embed.setFooter(options.footer);

    if (options.thumbnail) embed.setThumbnail(options.thumbnail);

    if (options.timestamp === true) embed.setTimestamp();

    if (options.url) embed.setURL(options.url);

    if (options.image) embed.setImage(options.image);

    return embed;
  }
}

interface EmbedInfo {
  title?: string;
  description?: string;
  url?: string;
  author?: { name: string; iconURL?: string };
  color?: ColorResolvable;
  thumbnail?: string | null;
  footer?: { text: string; iconURL?: string };
  timestamp?: boolean;
  image?: string;
}

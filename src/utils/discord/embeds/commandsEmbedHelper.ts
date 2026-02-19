import { ChatInputCommandInteraction } from "discord.js";
import { EmbedHelpers } from "./embedHelpers.js";
import { CommandInfo, Translator } from "../../../types/Command.js";
import { PaginationHelper } from "./paginationHelper.js";

export class CommandsEmbedHelper {
  static async createPaginatedCommandEmbed(
    interaction: ChatInputCommandInteraction,
    commands: CommandInfo[],
    t: Translator,
  ) {
    await PaginationHelper.createPagination(
      interaction,
      commands,
      (currentItems, page, total) => {
        return this.createCommandEmbed(interaction, currentItems, page, total, commands.length, t);
      },
      10,
      t,
    );
  }

  private static createCommandEmbed(
    interaction: ChatInputCommandInteraction,
    pageCommands: CommandInfo[],
    page: number,
    total: number,
    totalComandos: number,
    t: Translator,
  ) {
    const embed = EmbedHelpers.createEmbed({
      title: t("commands.utility.list-commands.title"),
      color: "#0099ff",
      description: t("commands.utility.list-commands.description", {
        page: page + 1,
        total: total,
        totalComandos: totalComandos,
      }),
      footer: {
        text: t("commands.utility.list-commands.footer_text", { page: page + 1, total: total }),
        iconURL: interaction.user.displayAvatarURL(),
      },
      timestamp: true,
    });

    const categoriesInPage = new Set(pageCommands.map((c) => c.category));

    categoriesInPage.forEach((cat) => {
      const catCommands = pageCommands
        .filter((c) => c.category === cat)
        .map((c) => `\`/${c.name}\` ${c.description}`)
        .join("\n");

      embed.addFields({
        name: `⭐ ${cat.toUpperCase()}`,
        value: catCommands || t("common.words.empty"),
        inline: false,
      });
    });

    return embed;
  }
}

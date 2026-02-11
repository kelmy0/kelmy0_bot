import { ChatInputCommandInteraction } from "discord.js";
import { EmbedHelpers } from "./embedHelpers.js";
import { Command } from "../../../types/Command.js";
import { PaginationHelper } from "./paginationHelper.js";

export class CommandsEmbedHelper {
  static async createPaginatedCommandEmbed(
    interaction: ChatInputCommandInteraction,
    commands: Map<string, Command>,
  ) {
    const commandArray = Array.from(commands.values());

    await PaginationHelper.createPagination(
      interaction,
      commandArray,
      (currentItems, page, total) => {
        // Chamamos o renderizador passando apenas os comandos da página atual
        return this.createCommandEmbed(currentItems, page, total, commandArray.length);
      },
      10, // Quantidade de comandos por página
    );
  }

  private static createCommandEmbed(
    pageCommands: Command[],
    page: number,
    total: number,
    totalTotal: number,
  ) {
    const embed = EmbedHelpers.createEmbed({
      title: "📋 Comandos Disponíveis",
      color: "#0099ff",
      description: `Exibindo comandos de **${page + 1}** de **${total}** (Total: ${totalTotal})`,
      footer: {
        text: `Use /help <comando> para detalhes • Página ${page + 1}/${total}`,
      },
    });

    const categoriesInPage = new Set(pageCommands.map((c) => c.metadata.category));

    categoriesInPage.forEach((cat) => {
      const catCommands = pageCommands
        .filter((c) => c.metadata.category === cat)
        .map((c) => `\`/${c.data.name}\` ${c.data.description}`)
        .join("\n");

      embed.addFields({
        name: `⭐ ${cat.toUpperCase()}`,
        value: catCommands || "Vazio",
        inline: false,
      });
    });

    return embed;
  }
}

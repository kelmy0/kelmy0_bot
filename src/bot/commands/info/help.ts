import { ApplicationIntegrationType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, Translator } from "../../../types/Command.js";
import { getCommands } from "../loader.js";
import { CommandsEmbedHelper } from "../../../utils/index.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setNameLocalizations({ "pt-BR": "ajuda" })

    .setDescription("List all bot's commands per category")
    .setDescriptionLocalizations({ "pt-BR": "Lista todos os comandos do bot por categoria" })
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall),

  metadata: {
    category: "info",
    production: true,
    cooldown: 30,
  },

  async execute(interaction: ChatInputCommandInteraction, t: Translator) {
    const commands = await getCommands({ environment: "production", excludeCategories: ["debug"] });
    CommandsEmbedHelper.createPaginatedCommandEmbed(interaction, commands, t);
  },
} satisfies Command;

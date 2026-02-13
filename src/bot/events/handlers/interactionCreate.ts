import { Interaction } from "discord.js";
import { getCommands } from "../../commands/loader.js";
import { PrismaClient } from "@prisma/client";
import { Translator } from "../../../types/Command.js";
import { t } from "../../../utils/i18nHelper.js";

export default {
  name: "interactionCreate",

  async execute(interaction: Interaction, prisma: PrismaClient) {
    const commands = await getCommands();

    // Command slash
    if (!interaction.isChatInputCommand()) return;

    // Search command in cache
    const command = commands.get(interaction.commandName);
    if (!command) {
      console.warn(`⚠️ Command not found: ${interaction.commandName}`);
      return;
    }

    try {
      console.log(`▶️  Running: /${interaction.commandName} by ${interaction.user.tag}`);

      const tForInteraction: Translator = (key, vars) => {
        return t.get(key, interaction.locale, vars);
      };

      await command.execute(interaction, tForInteraction, prisma);
    } catch (error) {
      console.error(`❌ Error in /${interaction.commandName}:`, error);

      // Reply based in interaction
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "❌ Error running command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "❌ Error running command!",
          ephemeral: true,
        });
      }
    }
  },
};

import { Interaction } from "discord.js";
import { getCommands } from "../../commands/loader.js";
import { PrismaClient } from "@prisma/client";
import { Translator } from "../../../types/Command.js";
import { t } from "../../../utils/i18nHelper.js";

export default {
  name: "interactionCreate",

  async execute(interaction: Interaction, prisma: PrismaClient) {
    const commands = await getCommands();

    // 1. Verifica se é um comando slash
    if (!interaction.isChatInputCommand()) return;

    // 2. Busca o comando no cache
    const command = commands.get(interaction.commandName);
    if (!command) {
      console.warn(`⚠️ Comando não encontrado: ${interaction.commandName}`);
      return;
    }

    // 3. Executa com tratamento de erros
    try {
      console.log(`▶️  Executando: /${interaction.commandName} por ${interaction.user.tag}`);

      const tForInteraction: Translator = (key, vars) => {
        return t.get(key, interaction.locale, vars);
      };

      await command.execute(interaction, tForInteraction, prisma);
    } catch (error) {
      console.error(`❌ Erro em /${interaction.commandName}:`, error);

      // Resposta adequada baseada no estado da interação
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "❌ Erro ao executar comando!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "❌ Erro ao executar comando!",
          ephemeral: true,
        });
      }
    }
  },
};

import { Interaction } from "discord.js";
import { Command } from "../../../types/Command.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getCommands } from "../../commands/loader.js";

const commands = await getCommands();

export default {
  name: "interactionCreate",

  async execute(interaction: Interaction) {
    // 1. Verifica se é um comando slash
    if (!interaction.isChatInputCommand()) return;

    // 2. Busca o comando no cache
    const command = commands.get(interaction.commandName);
    if (!command) {
      console.warn(`⚠️  Comando não encontrado: ${interaction.commandName}`);
      return;
    }

    // 3. Executa com tratamento de erros
    try {
      console.log(
        `▶️  Executando: /${interaction.commandName} por ${interaction.user.tag}`,
      );
      await command.execute(interaction);
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

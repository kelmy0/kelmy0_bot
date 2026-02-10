import { Interaction } from "discord.js";
import { getCommands } from "../../commands/loader.js";
import { PrismaClient } from "../../../../prisma/client/client.js";

export default {
  name: "interactionCreate",

  async execute(interaction: Interaction, prisma: PrismaClient) {
    const commands = await getCommands();

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
      await command.execute(interaction, prisma);
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

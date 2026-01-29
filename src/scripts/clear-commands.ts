import { Client, GatewayIntentBits } from "discord.js";
import { validateScriptEnv } from "./utils/env-validator.js";
import { config } from "dotenv";

config();

async function clearTestCommands() {
  try {
    console.log("🧹 Iniciando limpeza de comandos de teste...");

    // Validar ambiente (não permite produção sem guild de teste)
    const { token, guildTesterId, isProduction } = validateScriptEnv();

    if (isProduction) {
      console.log("⚠️  Em produção, só limpa comandos da guild de teste");
      console.log("⚠️  Comandos GLOBAIS NÃO SERÃO AFETADOS");
    }

    if (!guildTesterId) {
      throw new Error("GUILD_TESTER_ID é necessário para limpar comandos");
    }

    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.once("ready", async (readyClient) => {
      console.log(`🤖 Conectado como ${readyClient.user.tag}`);

      const guild = readyClient.guilds.cache.get(guildTesterId);
      if (!guild) {
        throw new Error(`Guild de teste não encontrada: ${guildTesterId}`);
      }

      // Obtém comandos atuais para mostrar no log
      const existingCommands = await guild.commands.fetch();
      console.log(`📊 Comandos atuais na guild: ${existingCommands.size}`);

      if (existingCommands.size > 0) {
        existingCommands.forEach((cmd) => {
          console.log(`  - ${cmd.name} (${cmd.id})`);
        });
      }

      // Remove todos os comandos da guild de teste
      await guild.commands.set([]);
      console.log(`✅ Todos os comandos removidos da guild de teste`);
      console.log(`📌 Guild: ${guild.name} (${guild.id})`);

      readyClient.destroy();
      process.exit(0);
    });

    client.on("error", (error) => {
      console.error("❌ Erro no cliente Discord:", error);
      process.exit(1);
    });

    await client.login(token);
  } catch (error) {
    console.error("❌ Erro ao limpar comandos:", error);
    process.exit(1);
  }
}

setTimeout(
  () => {
    console.error("⏰ Timeout excedido");
    process.exit(1);
  },
  2 * 60 * 1000,
);

clearTestCommands();

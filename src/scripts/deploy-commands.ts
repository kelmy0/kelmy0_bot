import { Client, GatewayIntentBits } from "discord.js";
import { getCommands } from "../bot/commands/loader.js";
import { validateScriptEnv } from "./utils/env-validator.js";
import { config } from "dotenv";

config();

async function deployCommands() {
  try {
    console.log("🚀 Iniciando deploy de comandos...");

    const { token, clientId, guildTesterId, isProduction } = validateScriptEnv();

    const commands = await getCommands({
      environment: isProduction ? "production" : "development",
    });

    console.log(
      `📦 ${commands.size} comando(s) para deploy em ${isProduction ? "produção" : "desenvolvimento"}`,
    );

    if (commands.size === 0) {
      console.log("ℹ️  Nenhum comando para registrar");
      return;
    }

    // Converte Map para array para o Discord API
    const commandData = Array.from(commands.values()).map((cmd) => cmd.data.toJSON());

    // Criar cliente apenas para deploy
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.once("clientReady", async (readyClient) => {
      console.log(`🤖 Conectado como ${readyClient.user.tag}`);

      if (isProduction) {
        // PRODUÇÃO: Registra globalmente e limpa guild de teste
        await readyClient.application.commands.set(commandData);
        console.log(`✅ ${commandData.length} comandos registrados GLOBALMENTE`);

        if (guildTesterId) {
          // Limpa apenas comandos da guild de teste
          await readyClient.guilds.cache.get(guildTesterId)?.commands.set([]);
          console.log(`🧹 Comandos removidos da guild de teste (${guildTesterId})`);
        }
      } else {
        // DESENVOLVIMENTO: Registra apenas na guild de teste
        if (!guildTesterId) {
          throw new Error("GUILD_TESTER_ID é necessário em desenvolvimento");
        }

        const guild = readyClient.guilds.cache.get(guildTesterId);
        if (!guild) {
          throw new Error(`Guild de teste não encontrada: ${guildTesterId}`);
        }

        await guild.commands.set(commandData);
        console.log(`✅ ${commandData.length} comandos registrados na guild de teste`);
        console.log(`📌 Guild: ${guild.name} (${guild.id})`);
      }

      console.log("🎉 Deploy concluído!");
      readyClient.destroy();
      process.exit(0);
    });

    // Tratamento de erros
    client.on("error", (error) => {
      console.error("❌ Erro no cliente Discord:", error);
      process.exit(1);
    });

    // Login
    await client.login(token);
  } catch (error) {
    console.error("❌ Erro no deploy:", error);
    process.exit(1);
  }
}

// Timeout de segurança (5 minutos)
setTimeout(
  () => {
    console.error("⏰ Timeout excedido");
    process.exit(1);
  },
  5 * 60 * 1000,
);

deployCommands();

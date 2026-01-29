import { Client, GatewayIntentBits } from "discord.js";
import { loadEvents } from "./config/load-events.js";
import { getPrismaClient, Database } from "./lib/database.js";
import { validateEnvironment } from "./config/enviroment.js";

async function main() {
  try {
    console.log("🚀 Inicializando bot Discord...");

    // 1. Validar ambiente
    const env = validateEnvironment();
    console.log("✅ Ambiente validado");

    const prisma = await getPrismaClient();

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    await loadEvents(client);

    await client.login(process.env.TOKEN);
    console.log(`🤖 Bot online como ${client.user?.tag}`);

    setupShutdownHandlers(client);
  } catch (error) {
    console.error("Erro ao iniciar bot: " + error);
    process.exit(1);
  }
}
function setupShutdownHandlers(client: Client) {
  const shutdown = async () => {
    console.log("\n🔻 Encerrando aplicação...");

    if (client.isReady()) {
      client.destroy();
      console.log("✅ Discord desconectado");
    }

    await Database.disconnect();
    console.log("✅ Banco desconectado");

    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();

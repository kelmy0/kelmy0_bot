import { getPrismaClient } from "./lib/database.js";
import { validateEnvironment } from "./config/enviroment.js";
import { createDiscordClient } from "./bot/client/index.js";
import { setupShutdownHandlers } from "./utils/shutdown.js";
import { loadEvents } from "./bot/events/loader.js";
import { config } from "dotenv";

config();

async function bootstrap() {
  try {
    console.log("🚀 Inicializando bot Discord...");

    // 1. Validar ambiente
    const env = validateEnvironment();
    console.log("✅ Ambiente validado");

    // 2. Inicializar o banco de dados
    const prisma = await getPrismaClient();
    console.log("✅ Banco de dados conectado");

    // 3. Criar cliente Discord
    const client = createDiscordClient();
    console.log("✅ Cliente discord criado");

    // 4. Carregar handlers de eventos
    await loadEvents(client, prisma);
    console.log("✅ Eventos carregados");

    // 5. Login
    await client.login(process.env.TOKEN);

    // 6. Configurar graceful shutdown
    setupShutdownHandlers(client);
  } catch (error) {
    console.error("❌ Falha crítica na inicialização:", error);
    process.exit(1);
  }
}
// Handlers globais de erro
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promise não tratada:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Exceção não capturada:", error);
  process.exit(1);
});

bootstrap();

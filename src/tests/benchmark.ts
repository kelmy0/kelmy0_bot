import "dotenv/config";
import { getCommands } from "../bot/commands/loader.js";
import { Database } from "../lib/database.js";
import { t } from "../utils/i18nHelper.js";
import { type TranslationPath } from "../locales/index.js";

async function runBenchmark(requisitions: number) {
  // Simulate bot
  const commands = await getCommands();
  const prisma = await Database.getInstance();
  const command = commands.get("list-images");

  if (!command) {
    console.error("Comando não encontrado!");
    process.exit(1);
  }

  // Interaction mock
  const createMockInteraction = (id: number) => {
    const optionsStore: Record<string, string | number | null> = {
      category: "miside",
      limit: 10,
      orderby: "desc",
    };

    const mockMessage = {
      createMessageComponentCollector: () => ({
        on: (event: string, callback: Function) => {},
        stop: () => {},
      }),
    };

    return {
      isChatInputCommand: () => true,
      commandName: "list-images",
      locale: "pt-BR",
      options: {
        getString: (name: string) => optionsStore[name] ?? null,
        getInteger: (name: string) => optionsStore[name] ?? null,
      },
      guild: {
        id: "guild_123",
        name: "Benchmark Guild",
        iconURL: () => "https://cdn.discordapp.com/embed/avatars/0.png",
        fetchOwner: async () => ({ user: { username: "Owner" } }),
        bans: { fetch: async () => ({ size: 10, map: () => [] }) },
      },
      user: { id: `user_${id}`, username: `Tester_${id}` },
      memberPermissions: { has: () => true },

      deferReply: async () => Promise.resolve(),
      reply: async () => Promise.resolve(mockMessage),
      editReply: async () => Promise.resolve(mockMessage),
    } as any;
  };

  console.log(`🚀 Iniciando benchmark: ${requisitions} execuções do comando 'list-images'...`);

  // Loop
  console.time("Tempo Total do Benchmark");

  for (let i = 0; i < requisitions; i++) {
    const interaction = createMockInteraction(i);

    const translator = (key: TranslationPath, vars?: any) => t.get(key, interaction.locale, vars);

    try {
      await command.execute(interaction, translator, prisma);
    } catch (err) {}

    if (i % 5000 === 0 && i !== 0) {
      console.log(`⚡ ${i} requisições processadas...`);
    }
  }

  console.timeEnd("Tempo Total do Benchmark");
  process.exit(0);
}

runBenchmark(100000).catch(console.error);

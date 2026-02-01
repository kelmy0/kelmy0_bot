import { readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import type { Command } from "../../types/Command.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function findCommandFiles(
  directory: string,
  fileList: string[] = [],
): string[] {
  const files = readdirSync(directory);

  for (const file of files) {
    const filePath = join(directory, file);

    try {
      const fileStat = statSync(filePath);

      if (fileStat.isDirectory()) {
        // Busca recursivamente APENAS dentro de commands/
        findCommandFiles(filePath, fileList);
      } else if (
        (file.endsWith(".ts") || file.endsWith(".js")) &&
        !file.endsWith(".d.ts") &&
        !file.includes(".test.") &&
        !file.includes(".spec.")
      ) {
        fileList.push(filePath);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`⚠️  Erro ao acessar ${filePath}:`, error.message);
      } else {
        console.warn(`⚠️  Erro desconhecido ao acessar ${filePath}:`, error);
      }
    }
  }

  return fileList;
}

export async function loadCommands(): Promise<Map<string, Command>> {
  const commands = new Map<string, Command>();
  const commandsPath = join(__dirname, ".");

  console.log(`📁 Buscando comandos em: ${commandsPath}`);

  // Encontra arquivos recursivamente
  const commandFiles = findCommandFiles(commandsPath);
  console.log(`🔍 Encontrados ${commandFiles.length} arquivos de comando`);

  // Contadores por categoria
  const categoryCount: Record<string, number> = {};

  for (const filePath of commandFiles) {
    try {
      const fileUrl = pathToFileURL(filePath).href;
      const commandModule = await import(fileUrl);

      if (commandModule.default?.data && commandModule.default?.execute) {
        const command: Command = commandModule.default;
        const commandName = command.data.name;

        // VALIDAÇÃO: Verifica se tem metadata
        if (!command.metadata) {
          console.warn(
            `⚠️  Comando sem metadata: ${commandName} (${filePath})`,
          );
          // Define metadata padrão
          command.metadata = {
            category: "debug",
            production: false, // Por segurança não vai para produção
          };
        }

        // Verifica duplicação
        if (commands.has(commandName)) {
          console.warn(`⚠️  Comando duplicado: ${commandName}`);
          continue;
        }

        // Atualiza contador de categoria
        const category = command.metadata.category;
        categoryCount[category] = (categoryCount[category] || 0) + 1;

        commands.set(commandName, command);

        // Log colorido por categoria
        const categoryColors: Record<string, string> = {
          debug: "🛠️",
          admin: "👑",
          utility: "🔧",
          config: "⚙️",
          fun: "🎮",
        };

        const emoji = categoryColors[category] || "📄";
        const prodFlag = command.metadata.production ? "✅" : "🚫";

        console.log(
          `${emoji} ${prodFlag} ${commandName.padEnd(20)} [${category}]`,
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`❌ Erro ao carregar ${filePath}:`, error.message);
      } else {
        console.error(`❌ Erro desconhecido ao carregar ${filePath}:`, error);
      }
    }
  }

  // Resumo
  console.log("\n📊 Resumo por categoria:");
  Object.entries(categoryCount).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} comando(s)`);
  });

  const totalForProduction = Array.from(commands.values()).filter(
    (cmd) => cmd.metadata.production,
  ).length;

  console.log(
    `\n🎯 Total: ${commands.size} comandos (${totalForProduction} para produção)`,
  );

  return commands;
}

export function filterCommands(
  commands: Map<string, Command>,
  options: {
    environment?: "development" | "production";
    categories?: string[];
    excludeCategories?: string[];
  } = {},
): Map<string, Command> {
  const filtered = new Map<string, Command>();

  for (const [name, command] of commands) {
    // Filtro por ambiente (produção)
    if (options.environment === "production" && !command.metadata.production) {
      continue;
    }

    // Filtro por categorias incluídas
    if (
      options.categories &&
      !options.categories.includes(command.metadata.category)
    ) {
      continue;
    }

    // Filtro por categorias excluídas
    if (
      options.excludeCategories &&
      options.excludeCategories.includes(command.metadata.category)
    ) {
      continue;
    }

    filtered.set(name, command);
  }

  return filtered;
}

// Cache global
let commandCache: Map<string, Command> | null = null;

export async function getCommands(
  filterOptions?: Parameters<typeof filterCommands>[1],
): Promise<Map<string, Command>> {
  if (!commandCache) {
    commandCache = await loadCommands();
  }

  if (filterOptions) {
    return filterCommands(commandCache, filterOptions);
  }

  return commandCache;
}

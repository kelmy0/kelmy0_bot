import { readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import type { Command } from "../../types/Command.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const commandMap = await loadCommands();

interface FilterOptions {
  environment?: "development" | "production";
  categories?: string[];
  excludeCategories?: string[];
}

function findCommandFiles(directory: string, fileList: string[] = []): string[] {
  const files = readdirSync(directory);

  for (const file of files) {
    const filePath = join(directory, file);

    try {
      const fileStat = statSync(filePath);

      if (fileStat.isDirectory()) {
        findCommandFiles(filePath, fileList);
      } else if (
        (file.endsWith(".ts") || file.endsWith(".js")) &&
        !file.endsWith(".d.ts") &&
        !file.includes(".test.") &&
        !file.includes(".spec.") &&
        file !== "loader.ts" &&
        file !== "loader.js"
      ) {
        fileList.push(filePath);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`⚠️  Error to access ${filePath}:`, error.message);
      } else {
        console.warn(`⚠️  Unknown error when accessing ${filePath}:`, error);
      }
    }
  }

  return fileList;
}

export async function loadCommands(): Promise<Map<string, Command>> {
  const commands = new Map<string, Command>();
  const commandsPath = join(__dirname, ".");

  console.log(`📁 Searching for commands in: ${commandsPath}`);

  // Search files recursively
  const commandFiles = findCommandFiles(commandsPath);
  console.log(`🔍 Found ${commandFiles.length} commands files`);

  // Count per category
  const categoryCount: Record<string, number> = {};

  for (const filePath of commandFiles) {
    try {
      const fileUrl = pathToFileURL(filePath).href;
      const commandModule = await import(fileUrl);

      if (commandModule.default?.data && commandModule.default?.execute) {
        const command: Command = commandModule.default;
        const commandName = command.data.name;

        // VALIDATION
        if (!command.metadata) {
          console.warn(`⚠️  Command without metadata: ${commandName} (${filePath})`);
          // Default metadata
          command.metadata = {
            category: "debug",
            production: false,
          };
        }

        // Duplication
        if (commands.has(commandName)) {
          console.warn(`⚠️ Duplicate command: ${commandName}`);
          continue;
        }

        // Atualiza contador de categoria
        const category = command.metadata.category;
        categoryCount[category] = (categoryCount[category] || 0) + 1;

        commands.set(commandName, command);

        // Log per category
        const categoryColors: Record<string, string> = {
          debug: "🛠️",
          admin: "👑",
          utility: "🔧",
          moderation: "🛡️",
          config: "⚙️",
          fun: "🎮",
        };

        const emoji = categoryColors[category] || "📄";
        const prodFlag = command.metadata.production ? "✅" : "🚫";

        console.log(`${emoji} ${prodFlag} ${commandName.padEnd(20)} [${category}]`);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`❌ Error loading ${filePath}:`, error.message);
      } else {
        console.error(`❌ Unknown error to loading ${filePath}:`, error);
      }
    }
  }

  // Resume
  console.log("\n📊 Resume per category:");
  Object.entries(categoryCount).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} commands`);
  });

  const totalForProduction = Array.from(commands.values()).filter((cmd) => cmd.metadata.production).length;

  console.log(`\n🎯 Total: ${commands.size} commands (${totalForProduction} to production)`);

  return commands;
}

export function getFilteredCommands(options: FilterOptions = {}): Command[] {
  const allCommands = Array.from(commandMap.values());

  return allCommands.filter((command) => {
    if (options.environment === "production" && !command.metadata.production) return false;
    if (options.categories && !options.categories.includes(command.metadata.category)) return false;
    if (options.excludeCategories && options.excludeCategories.includes(command.metadata.category))
      return false;
    return true;
  });
}

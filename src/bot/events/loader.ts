import { Client } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Database } from "../../lib/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type PrismaInstance = Awaited<ReturnType<typeof Database.getInstance>>;

export async function loadEvents(client: Client, prisma: PrismaInstance) {
  const eventsPath = path.join(__dirname, "handlers");

  if (!fs.existsSync(eventsPath)) {
    console.warn(`⚠️ Event folder not found: ${eventsPath}`);
    return;
  }

  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

  console.log(`📁 Found ${eventFiles.length} events handlers`);

  for (const file of eventFiles) {
    try {
      const filePath = path.join(eventsPath, file);
      const fileUrl = pathToFileURL(filePath).href;
      const eventModule = await import(fileUrl);
      const event = eventModule.default;

      if (!event || !event.name || typeof event.execute !== "function") {
        console.warn(`⚠️ Invalid handler in ${file}`);
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, prisma));
      } else {
        client.on(event.name, (...args) => event.execute(...args, prisma));
      }

      console.log(`✅ Event registered: ${event.name} (${file})`);
    } catch (error) {
      console.error(`❌ Error loading ${file}:`, error);
    }
  }
}

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, "../../../prisma/schema.prisma");

const SUPPORTED_PROVIDERS = ["sqlserver", "postgresql", "mongodb"];

async function syncSchema() {
  const provider = process.env.DB_PROVIDER?.toLowerCase();

  if (!provider || !SUPPORTED_PROVIDERS.includes(provider)) {
    console.error(`❌ Error: DB_PROVIDER "${provider}" invalid.`);
    process.exit(1);
  }

  try {
    let schemaContent = fs.readFileSync(schemaPath, "utf8");

    const datasourceRegex = /datasource\s+db\s+{[^}]+}/;
    const match = schemaContent.match(datasourceRegex);

    if (!match) {
      console.error("❌ Error: Block 'datasource db' not found.");
      process.exit(1);
    }

    let datasourceBlock = match[0];

    const updatedDatasourceBlock = datasourceBlock.replace(
      /provider\s*=\s*"[^"]+"/,
      `provider = "${provider}"`,
    );

    const updatedSchema = schemaContent.replace(datasourceBlock, updatedDatasourceBlock);

    if (schemaContent === updatedSchema) {
      console.log(`ℹ️  The datasource is already configured for "${provider}".`);
    } else {
      fs.writeFileSync(schemaPath, updatedSchema);
      console.log(`✅ [Sync] Updated datasource provider to: ${provider}`);
    }
  } catch (error) {
    console.error("❌ Error processing schema:", error);
    process.exit(1);
  }
}

syncSchema();

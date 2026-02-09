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
    console.error(`❌ Erro: DB_PROVIDER "${provider}" inválido.`);
    process.exit(1);
  }

  try {
    let schemaContent = fs.readFileSync(schemaPath, "utf8");

    const datasourceRegex = /datasource\s+db\s+{[^}]+}/;
    const match = schemaContent.match(datasourceRegex);

    if (!match) {
      console.error("❌ Erro: Bloco 'datasource db' não encontrado.");
      process.exit(1);
    }

    let datasourceBlock = match[0];

    const updatedDatasourceBlock = datasourceBlock.replace(
      /provider\s*=\s*"[^"]+"/,
      `provider = "${provider}"`,
    );

    const updatedSchema = schemaContent.replace(datasourceBlock, updatedDatasourceBlock);

    if (schemaContent === updatedSchema) {
      console.log(`ℹ️  O datasource já está configurado para "${provider}".`);
    } else {
      fs.writeFileSync(schemaPath, updatedSchema);
      console.log(`✅ [Sync] Provider do datasource atualizado para: ${provider}`);
    }
  } catch (error) {
    console.error("❌ Erro ao processar o schema:", error);
    process.exit(1);
  }
}

syncSchema();

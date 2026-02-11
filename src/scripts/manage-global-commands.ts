import { ApplicationCommand, Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import readline from "readline";

config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function manageGlobalCommands() {
  try {
    console.log("⚠️  ⚠️  ⚠️  GERENCIAMENTO DE COMANDOS GLOBAIS ⚠️  ⚠️  ⚠️");
    console.log("Esta ação afeta TODOS os servidores onde o bot está!");
    console.log("");

    // 1. Validação básica
    if (!process.env.TOKEN || !process.env.CLIENT_ID) {
      throw new Error("TOKEN e CLIENT_ID são obrigatórios");
    }

    // 2. Lista opções
    console.log("Opções:");
    console.log("1. 📋 Listar comandos globais atuais");
    console.log("2. 🗑️  Remover UM comando específico (por nome ou ID)");
    console.log("3. 🧹 Remover TODOS os comandos globais (PERIGOSO!)");
    console.log("4. ❌ Sair");

    const option = await question("\nEscolha uma opção (1-4): ");

    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    await client.login(process.env.TOKEN);

    client.once("ready", async (readyClient) => {
      console.log(`\n🤖 Conectado como ${readyClient.user.tag}`);

      const appCommands = readyClient.application.commands;

      switch (option) {
        case "1":
          await listGlobalCommands(appCommands);
          break;

        case "2":
          await deleteSingleCommand(appCommands);
          break;

        case "3":
          await deleteAllGlobalCommands(appCommands);
          break;

        case "4":
          console.log("👋 Saindo...");
          break;

        default:
          console.log("❌ Opção inválida");
      }

      readyClient.destroy();
      rl.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Erro:", error);
    rl.close();
    process.exit(1);
  }
}

async function listGlobalCommands(appCommands: any) {
  const commands = await appCommands.fetch();

  console.log(`\n📋 ${commands.size} Comando(s) Global(is):`);
  console.log("─".repeat(50));

  commands.forEach((cmd: ApplicationCommand) => {
    console.log(`├─ ${cmd.name} (ID: ${cmd.id})`);
    console.log(`│  Descrição: ${cmd.description}`);
    console.log(`│  Criado em: ${cmd.createdAt.toLocaleDateString()}`);
    console.log("├" + "─".repeat(48));
  });
}

async function deleteSingleCommand(appCommands: any) {
  const commands = await appCommands.fetch();

  if (commands.size === 0) {
    console.log("ℹ️  Nenhum comando global para remover");
    return;
  }

  console.log("\nComandos disponíveis para remoção:");
  commands.forEach((cmd: ApplicationCommand, index: number) => {
    console.log(`${index + 1}. ${cmd.name} (ID: ${cmd.id})`);
  });

  const choice = await question("\nDigite o NOME ou ID do comando a remover: ");

  // Tenta encontrar por ID ou nome
  const commandToDelete = commands.find(
    (cmd: ApplicationCommand) => cmd.id === choice || cmd.name.toLowerCase() === choice.toLowerCase(),
  );

  if (!commandToDelete) {
    console.log("❌ Comando não encontrado");
    return;
  }

  console.log(`\n⚠️  Você está prestes a remover: ${commandToDelete.name} (${commandToDelete.id})`);
  console.log("Este comando será removido de TODOS os servidores!");

  const confirm = await question('Digite "SIM" para confirmar: ');

  if (confirm.toUpperCase() === "SIM") {
    await commandToDelete.delete();
    console.log(`✅ Comando "${commandToDelete.name}" removido globalmente`);
  } else {
    console.log("❌ Operação cancelada");
  }
}

async function deleteAllGlobalCommands(appCommands: any) {
  const commands = await appCommands.fetch();

  if (commands.size === 0) {
    console.log("ℹ️  Nenhum comando global para remover");
    return;
  }

  console.log(`\n⚠️  ⚠️  ⚠️  ALERTA CRÍTICO! ⚠️  ⚠️  ⚠️`);
  console.log(`Você está prestes a remover ${commands.size} comando(s) GLOBALMENTE:`);

  commands.forEach((cmd: ApplicationCommand) => {
    console.log(`  • ${cmd.name} (${cmd.id})`);
  });

  console.log("\n❗ Esta ação NÃO PODE ser desfeita!");
  console.log("❗ Todos os servidores perderão acesso a esses comandos");
  console.log("❗ Pode levar até 1 hora para as mudanças propagarem");

  const confirm1 = await question('\nDigite "CONFIRMAR" para continuar: ');
  if (confirm1.toUpperCase() !== "CONFIRMAR") {
    console.log("❌ Operação cancelada (primeira confirmação)");
    return;
  }

  const confirm2 = await question('Digite "SIM EU TENHO CERTEZA": ');
  if (confirm2.toUpperCase() !== "SIM EU TENHO CERTEZA") {
    console.log("❌ Operação cancelada (segunda confirmação)");
    return;
  }

  console.log("\n🧹 Removendo comandos globais...");

  // Remove um por um com delay para evitar rate limits
  for (const cmd of commands.values()) {
    try {
      await cmd.delete();
      console.log(`✅ Removido: ${cmd.name}`);
      await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay
    } catch (error) {
      console.error(`❌ Erro ao remover ${cmd.name}:`, error);
    }
  }

  console.log("🎉 Todos os comandos globais foram removidos");
}

// Timeout de segurança
setTimeout(
  () => {
    console.error("⏰ Timeout excedido (5 minutos)");
    rl.close();
    process.exit(1);
  },
  5 * 60 * 1000,
);

manageGlobalCommands();

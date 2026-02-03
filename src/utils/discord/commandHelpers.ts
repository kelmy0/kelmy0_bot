import { ChatInputCommandInteraction } from "discord.js";
import { splitMessage } from "../string/splitter.js";

export async function handleCommandError(
  interaction: ChatInputCommandInteraction,
  action: string,
  error: unknown,
): Promise<void> {
  console.error(`Erro em ${action}:`, error);

  const errorMessage =
    error instanceof Error ? error.message : "Erro desconhecido";

  await interaction.editReply({
    content: `❌ Erro interno ao processar comando: ${errorMessage}`,
  });
}

export async function sendPaginatedResponse(
  interaction: ChatInputCommandInteraction,
  content: string,
  maxLength: number = 1900,
): Promise<void> {
  if (content.length <= maxLength) {
    await interaction.editReply(content);
    return;
  }

  const parts = splitMessage(content, maxLength);
  await interaction.editReply(parts[0]);

  for (let i = 1; i < parts.length; i++) {
    await interaction.followUp({
      content: parts[i],
      ephemeral: true,
    });
  }
}

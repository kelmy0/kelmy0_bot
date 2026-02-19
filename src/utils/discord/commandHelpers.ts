import { ChatInputCommandInteraction } from "discord.js";
import { splitMessage } from "../index.js";
import { Translator } from "../../types/Command.js";

export async function handleCommandError(
  interaction: ChatInputCommandInteraction,
  action: string,
  error: unknown,
  t: Translator,
): Promise<void> {
  console.error(`Error in ${action}:`, error);

  const errorMessage = error instanceof Error ? error.message : t("common.words.unknown");

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({
      content: t("common.errors.generic", { error: errorMessage }),
    });
  } else {
    await interaction.reply({
      content: t("common.errors.generic", { error: errorMessage }),
    });
  }
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

import {
  ChatInputCommandInteraction,
  InteractionEditReplyOptions,
  InteractionReplyOptions,
  MessagePayload,
} from "discord.js";
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

  await smartReply(interaction, t("common.errors.generic", { error: errorMessage }));
}

export async function smartReply(
  interaction: ChatInputCommandInteraction,
  options: string | MessagePayload | InteractionReplyOptions | InteractionEditReplyOptions,
) {
  const payload = typeof options === "string" ? { content: options } : options;

  if (interaction.deferred || interaction.replied) {
    const { flags: _, ...editPayload } = payload as any;
    return await interaction.editReply(editPayload);
  }

  return await interaction.reply(payload as InteractionReplyOptions);
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

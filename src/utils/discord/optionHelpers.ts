import {
  ChatInputCommandInteraction,
} from "discord.js";

export function getOptionalNumber(
  interaction: ChatInputCommandInteraction,
  optionName: string,
): number | undefined {
  const value = interaction.options.getNumber(optionName);
  return value !== null ? value : undefined;
}

export function getOptionalString(
  interaction: ChatInputCommandInteraction,
  optionName: string,
): string | undefined {
  const value = interaction.options.getString(optionName);
  return value !== null ? value : undefined;
}

export function getOptionalBoolean(
  interaction: ChatInputCommandInteraction,
  optionName: string,
): boolean | undefined {
  const value = interaction.options.getBoolean(optionName);
  return value !== null ? value : undefined;
}

export function getOptionalInteger(
  interaction: ChatInputCommandInteraction,
  optionName: string,
): number | undefined {
  const value = interaction.options.getInteger(optionName);
  return value !== null ? value : undefined;
}

// Helper para converter de forma segura null para undefined
export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

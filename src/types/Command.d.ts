import { SlashCommandBuilder, ChatInputCommandInteraction, SlashCommandOptionsOnlyBuilder } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { TranslationPath } from "../locales/index.ts";

export type Translator = (
  key: TranslationPath,
  vars?: Record<string, string | number | null | undefined>,
) => string;

export interface CommandMetadata {
  category: "admin" | "moderation" | "utility" | "debug" | "config" | "fun" | "info";
  production: boolean;
  cooldown?: number; // Default is 3
  silent?: boolean; // Default is false
}

export interface Command {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction, t: Translator, prisma?: PrismaClient) => Promise<void>;
  metadata: CommandMetadata;
}

import { SlashCommandBuilder, ChatInputCommandInteraction, SlashCommandOptionsOnlyBuilder } from "discord.js";
import { PrismaClient } from "@prisma/client";

export interface CommandMetadata {
  category: "admin" | "moderation" | "utility" | "debug" | "config" | "fun";
  production: boolean;
  cooldown?: number;
}

export interface Command {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction, prisma?: PrismaClient) => Promise<void>;
  metadata: CommandMetadata;
}

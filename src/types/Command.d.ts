import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import { PrismaClient } from "../generated/prisma/client.ts";

export interface CommandMetadata {
  category: "admin" | "utility" | "debug" | "config" | "fun";
  production: boolean;
  description?: string;
  cooldown?: number;
}

export interface Command {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    | SlashCommandOptionsOnlyBuilder;
  execute: (
    interaction: ChatInputCommandInteraction,
    prisma?: PrismaClient,
  ) => Promise<void>;
  metadata: CommandMetadata;
}

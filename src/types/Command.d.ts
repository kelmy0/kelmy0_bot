import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export interface CommandMetadata {
  category: "admin" | "utility" | "debug" | "config" | "fun";
  production: boolean;
  description?: string;
  cooldown?: number;
}

export interface Command {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  metadata: CommandMetadata;
}

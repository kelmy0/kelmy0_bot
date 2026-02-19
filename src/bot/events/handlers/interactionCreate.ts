import { Collection, Interaction } from "discord.js";
import { commandMap } from "../../commands/loader.js";
import { PrismaClient } from "@prisma/client";
import { Translator, BotEvent } from "../../../types/index.js";
import { t } from "../../../utils/i18nHelper.js";

// Cooldowns per user <CommandName, <UserID, Expiration timestamp>>
const cooldowns = new Collection<string, Collection<string, number>>();
const lastWarning = new Collection<string, number>();

export default {
  name: "interactionCreate",
  once: false,

  async execute(interaction: Interaction, prisma: PrismaClient): Promise<void> {
    // Slash Command
    if (!interaction.isChatInputCommand()) return;

    // Search command in cache
    const command = commandMap.get(interaction.commandName);
    if (!command) {
      console.warn(`⚠️ Command not found: ${interaction.commandName}`);
      return;
    }

    // Translator

    const translate: Translator = (key, vars) => t.get(key, interaction.locale, vars);

    // Cooldown
    const userId = interaction.user.id;
    const cmdName = command.data.name;
    const requestKey = `${userId}-${cmdName}`;
    const now = Date.now();

    // Cooldown configs
    const silent = command.metadata.silent ?? false;
    const cooldownAmount = (command.metadata.cooldown ?? 3) * 1000; // 3 seconds

    // Cooldown Bucket Management
    if (!cooldowns.has(cmdName)) {
      cooldowns.set(cmdName, new Collection());
    }

    const timestamps = cooldowns.get(cmdName)!;

    // Verify cooldown
    if (timestamps.has(userId)) {
      const expirationTime = timestamps.get(userId)! + cooldownAmount;

      if (now < expirationTime) {
        if (silent) return;

        const lastWarn = lastWarning.get(requestKey) || 0;

        if (now - lastWarn < 5000) return;

        lastWarning.set(requestKey, now);
        const timeLeft = (expirationTime - now) / 1000;

        await interaction
          .reply({
            content: translate("common.errors.too_many_requests", { time: timeLeft.toFixed(1) }),
            flags: "Ephemeral",
          })
          .catch(() => {});

        return;
      }
    }

    timestamps.set(userId, now);
    setTimeout(() => timestamps.delete(userId), cooldownAmount);

    try {
      console.log(`▶️  Running: /${interaction.commandName} by ${interaction.user.tag}`);

      await command.execute(interaction, translate, prisma, commandMap);
    } catch (error) {
      console.error(`❌ Error in /${interaction.commandName}:`, error);

      const errorMessage = { content: "❌ Error running command!", ephemeral: true };

      // Reply based in interaction
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage).catch(() => {});
      } else {
        await interaction.reply(errorMessage).catch(() => {});
      }
    }
  },
} satisfies BotEvent;

import { Message } from "discord.js";
import { BotEvent } from "../../../types/index.js";

export default {
  name: "messageCreate",
  once: false,
  async execute(message: Message) {
    if (message.author.bot) return;

    const emojis = ["👍", "😂", "🔥", "<:mitasex:1465187155994476585>"];
    if (Math.random() < 0.2) {
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      await message.react(randomEmoji);
    }
  },
} satisfies BotEvent;

import { Message } from "discord.js";

export default {
  name: "messageCreate",
  async execute(message: Message) {
    if (message.author.bot) return;

    const emojis = ["👍", "😂", "🔥", "<:mitasex:1465187155994476585>"];
    if (Math.random() < 0.2) {
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      await message.react(randomEmoji);
    }
  },
};

import { Message } from "discord.js";

export default {
  name: "messageCreate",
  async execute(message: Message) {
    if (message.author.bot) return;

    const chance = 0.1; // 10% de chance de responder
    if (Math.random() < chance) {
      const respostas = [
        "Oi 👋",
        "Interessante isso 🤔",
        "Haha",
        "Boa ideia!",
        "Ninguém liga",
      ];
      const resposta = respostas[Math.floor(Math.random() * respostas.length)];
      await message.reply(resposta);
    }
  },
};

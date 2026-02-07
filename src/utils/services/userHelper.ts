import { Interaction } from "discord.js";
import { PrismaClient } from "../../generated/prisma/client.js";
import UserService, { DiscordUserInfo } from "../../services/userService.js";

export function extractDiscordUserInfo(
  interaction: Interaction,
): DiscordUserInfo {
  const user = interaction.user || interaction.member?.user;

  if (!user) {
    throw new Error("Não foi possível obter informações do usuário do Discord");
  }

  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    globalName: user.globalName,
  };
}

export async function getOrRegisterUser(
  prisma: PrismaClient,
  interaction: Interaction,
): Promise<string> {
  try {
    const discordInfo = extractDiscordUserInfo(interaction);
    const userService = new UserService(prisma);
    const result = await userService.upsertUser(discordInfo);

    if (!result.success || !result.data) {
      console.warn(`Falha ao upsert usuário: ${result.message}`);
      return discordInfo.id;
    }

    return result.data.id;
  } catch (error) {
    console.error("Erro crítico em getOrRegisterUser:", error);
    const discordInfo = extractDiscordUserInfo(interaction);
    return discordInfo.id;
  }
}

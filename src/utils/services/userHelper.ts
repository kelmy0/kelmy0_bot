import { Interaction } from "discord.js";
import { PrismaClient } from "@prisma/client";
import UserService, { DiscordUserInfo } from "../../services/userService.js";

export function extractDiscordUserInfo(interaction: Interaction): DiscordUserInfo {
  const user = interaction.user || interaction.member?.user;

  if (!user) {
    throw new Error("Não foi possível obter informações do usuário do Discord");
  }

  const discordAvatarUrl =
    user.avatarURL() ?? `https://cdn.discordapp.com/embed/avatars/${Number(user.id) % 5}.png`;

  return {
    id: user.id,
    username: user.username,
    avatar: discordAvatarUrl,
    globalName: user.globalName,
  };
}

export async function getOrRegisterUser(
  prisma: PrismaClient,
  interaction: Interaction,
): Promise<getOrRegisterUserResponse> {
  try {
    const discordInfo = extractDiscordUserInfo(interaction);
    const userService = new UserService(prisma);
    const result = await userService.upsertUser(discordInfo);

    if (!result.success || !result.data) {
      console.warn(`Falha ao upsert usuário: ${result.message}`);
      return { id: discordInfo.id, username: discordInfo.username };
    }

    return { username: result.data.username, id: result.data.id };
  } catch (error) {
    console.error("Erro crítico em getOrRegisterUser:", error);
    const discordInfo = extractDiscordUserInfo(interaction);
    return { id: discordInfo.id, username: discordInfo.username };
  }
}

interface getOrRegisterUserResponse {
  username: string;
  id: string;
}

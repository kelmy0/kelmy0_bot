import { Interaction } from "discord.js";
import { PrismaClient } from "../generated/prisma/client.js";
import UserService from "../bot/services/userService.js";

export async function getOrRegisterUser(
  prisma: PrismaClient,
  interaction: Interaction,
): Promise<string> {
  const userId = (() => {
    if (!interaction.isCommand()) {
      throw new Error("Interaction não é um comando");
    }

    const u = interaction.user;

    return {
      id: u.id,
      username: u.username,
      tag: u.tag,
      avatar: u.avatar,
      globalName: u.globalName,
      discriminator: u.discriminator,
    };
  })();

  const userService = new UserService(prisma);

  try {
    let user = await userService.getUserById(userId.id);

    if (user) {
      await userService.updateUserInfo(
        userId.id,
        userId.tag,
        userId.avatar,
        userId.globalName,
        userId.discriminator,
      );
    } else {
      user = await userService.createUser(
        userId.id,
        userId.tag,
        userId.avatar,
        userId.globalName,
        userId.discriminator,
      );
    }

    return user.id;
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      if (error.code === "P2002") {
        console.warn(
          `⚠️  Race condition para usuário ${userId.id}, buscando novamente...`,
        );
        const existingUser = await userService.getUserById(userId.id);
        if (existingUser) return existingUser.id;
      }
    }

    throw error;
  }
}

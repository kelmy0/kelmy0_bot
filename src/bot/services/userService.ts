import { PrismaClient } from "../../generated/prisma/client.js";

export default class UserService {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async createUser(
    id: string,
    username: string,
    avatar: string | null = null,
    globalName: string | null = null,
    discriminator: string | null = null,
  ) {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          id: id,
          username: username,
          avatar: avatar,
          globalName: globalName,
          discriminator: discriminator,
        },
      });

      return newUser;
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "P2002") {
        throw new Error(`O Usuario "${id}" já existe!`);
      }
      throw error;
    }
  }

  public async updateUserInfo(
    id: string,
    username: string,
    avatar: string | null = null,
    globalName: string | null = null,
    discriminator: string | null = null,
  ) {
    const updateUser = await this.prisma.user.update({
      where: { id },
      data: {
        username: username,
        avatar: avatar,
        globalName: globalName,
        discriminator: discriminator,
      },
    });

    return updateUser;
  }

  public async getUserById(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id } });
    return user;
  }
}

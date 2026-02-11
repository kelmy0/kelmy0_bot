import { PrismaClient, User } from "@prisma/client";
import { ServiceResponse } from "../types/ServiceResponse.js";
import { handlePrismaError, PrismaErrorHandlers } from "../utils/prisma/errorHandler.js";
import { BaseService } from "./base/BaseService.js";

export interface DiscordUserInfo {
  id: string;
  username: string;
  avatar: string;
  globalName: string | null;
}

export interface UserResponse {
  id: string;
  username: string;
  avatar: string;
  globalName: string | null;
}

export default class UserService extends BaseService {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  public async upsertUser(userInfo: DiscordUserInfo): Promise<ServiceResponse<UserResponse>> {
    try {
      const user = await this.prisma.user.upsert({
        where: { id: userInfo.id },
        update: {
          username: userInfo.username,
          avatar: userInfo.avatar,
          globalName: userInfo.globalName,
        },
        create: {
          id: userInfo.id,
          username: userInfo.username,
          avatar: userInfo.avatar,
          globalName: userInfo.globalName,
        },
      });

      return this.success(
        `Usuário **${user.username}** ${user.updatedAt.getTime() === user.createdAt.getTime() ? "registrado" : "atualizado"} com sucesso.`,
        this.mapToResponse<User, UserResponse>(user),
      );
    } catch (error) {
      return handlePrismaError(error, {
        P2002: PrismaErrorHandlers.duplicateEntry(
          `❌ O usuário **${userInfo.username}** já está registrado!`,
          "DUPLICATE_USER",
        ),
      });
    }
  }

  public async createUser(userInfo: DiscordUserInfo): Promise<ServiceResponse<UserResponse>> {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          id: userInfo.id,
          username: userInfo.username,
          avatar: userInfo.avatar,
          globalName: userInfo.globalName,
        },
      });

      return this.success(
        `Usuario **${newUser.username}** registrado com sucesso.`,
        this.mapToResponse<User, UserResponse>(newUser),
      );
    } catch (error) {
      return handlePrismaError(error, {
        P2002: PrismaErrorHandlers.duplicateEntry(
          `O usuario **${userInfo.username}** já esta registrado!`,
          "DUPLICATE_USER",
        ),
      });
    }
  }

  public async updateUserInfo(userInfo: DiscordUserInfo): Promise<ServiceResponse<UserResponse>> {
    try {
      const updateUser = await this.prisma.user.update({
        where: { id: userInfo.id },
        data: {
          username: userInfo.username,
          avatar: userInfo.avatar,
          globalName: userInfo.globalName,
        },
      });

      return this.success(
        `Usuario **${userInfo.username}** atualizado com sucesso.`,
        this.mapToResponse<User, UserResponse>(updateUser),
      );
    } catch (error) {
      return handlePrismaError(error, {
        P2025: PrismaErrorHandlers.notFound(
          `Usuario **${userInfo.username}** não encontrado!`,
          "USER_NOT_FOUND",
        ),
      });
    }
  }

  public async getUserById(id: string): Promise<ServiceResponse<UserResponse>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return this.error(`❌ Usuário com ID **${id}** não encontrado!`, "USER_NOT_FOUND");
      }

      return this.success(
        `Usuario **${user.username}** encontrado!`,
        this.mapToResponse<User, UserResponse>(user),
      );
    } catch (error) {
      return handlePrismaError(error, {
        P2025: PrismaErrorHandlers.notFound(`Usuario com ID **${id}** não encontrado!`, "USER_NOT_FOUND"),
      });
    }
  }

  public async findUserById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  public async userExists(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      select: { id: true },
    });
    return !!user;
  }
}

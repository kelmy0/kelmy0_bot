import { BaseService } from "./base/BaseService.js";
import { ServiceResponse } from "../types/ServiceResponse.js";
import {
  handlePrismaError,
  PrismaErrorHandlers,
} from "../utils/prisma/errorHandler.js";
import { normalizeString } from "../utils/string/normalizer.js";
import {
  normalizeImageUrl,
  normalizeTags,
} from "../utils/services/imagesHelper.js";
import UserService from "./userService.js";
import CategoryService from "./categoryService.js";
import { PrismaClient } from "../generated/prisma/client.js";

export interface ImageInfo {
  url: string;
  title?: string | null;
  description?: string | null;
  category: string;
  addedById: string;
  tags?: string | null;
}

export interface ImageResponse {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  categoryId: number;
  categoryName: string;
  addedById: string;
  addedByUsername: string | null;
  tags: string | null;
  usageCount: number;
  addedAt: Date;
}

export default class ImageService extends BaseService {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  public async addImageUrl(
    infos: ImageInfo,
  ): Promise<ServiceResponse<ImageResponse>> {
    try {
      const normalizedUrl = normalizeImageUrl(infos.url);
      if (!normalizedUrl) {
        return this.error(`❌ URL inválida!`, "INVALID_URL");
      }

      const normalizedCategory = normalizeString(infos.category, {
        toLowerCase: true,
        trim: true,
        normalizeDiacritics: true,
        replaceSpaces: " ",
      });

      if (!normalizedCategory) {
        return this.error(
          `❌ Categoria não pode estar vazia!`,
          "INVALID_CATEGORY",
        );
      }

      const category = await this.prisma.imagesCategory.findUnique({
        where: { name: normalizedCategory },
      });

      if (!category) {
        return this.error(
          `❌ Categoria "${infos.category}" não existe!`,
          "CATEGORY_NOT_FOUND",
        );
      }

      // Verificar se usuário existe
      const userExists = await this.prisma.user.findUnique({
        where: { id: infos.addedById },
        select: { id: true },
      });

      if (!userExists) {
        return this.error(`❌ Usuário não cadastrado!`, "USER_NOT_FOUND");
      }

      const normalizedTags = infos.tags ? normalizeTags(infos.tags) : null;

      const normalizedTitle = infos.title
        ? normalizeString(infos.title, {
            toLowerCase: false,
            trim: true,
            normalizeDiacritics: true,
            replaceSpaces: true,
          })
        : null;

      const normalizedDescription = infos.description
        ? normalizeString(infos.description, {
            toLowerCase: false,
            trim: true,
            normalizeDiacritics: true,
            replaceSpaces: true,
          })
        : null;

      const newImage = await this.prisma.image.create({
        data: {
          url: normalizedUrl,
          title: normalizedTitle,
          description: normalizedDescription,
          categoryId: category.id,
          addedById: infos.addedById,
          tags: normalizedTags,
        },
        include: {
          category: { select: { name: true } },
          addedBy: { select: { username: true } },
        },
      });

      return this.success(
        `✅ Imagem adicionada com sucesso!\n` +
          `**ID:** ${newImage.id}\n` +
          `**URL:** ${newImage.url}\n` +
          `**Categoria:** ${newImage.category.name}\n` +
          (normalizedTitle ? `**Título:** ${normalizedTitle}\n` : "") +
          (normalizedTags ? `**Tags:** ${normalizedTags}` : ""),
        this.mapToResponse(newImage),
      );
    } catch (error) {
      return handlePrismaError(error, {
        P2002: PrismaErrorHandlers.duplicateEntry(
          `❌ Esta imagem já existe no banco de dados!`,
          "DUPLICATE_IMAGE",
        ),
        P2003: () =>
          this.error(
            `❌ Referência inválida (usuário ou categoria não existe)`,
            "FOREIGN_KEY_CONSTRAINT",
          ),
      });
    }
  }

  public async deleteImage(
    id: string,
  ): Promise<ServiceResponse<{ deletedUrl: string }>> {
    try {
      const deleted = await this.prisma.image.delete({
        where: { id },
        include: { category: { select: { name: true } } },
      });

      return this.success(
        `✅ Imagem **${deleted.url}** (Categoria: ${deleted.category.name}) deletada com sucesso!`,
        { deletedUrl: deleted.url },
      );
    } catch (error) {
      return handlePrismaError(error, {
        P2025: PrismaErrorHandlers.notFound(
          `❌ Imagem com ID "${id}" não encontrada!`,
          "IMAGE_NOT_FOUND",
        ),
      });
    }
  }

  public async getImageById(
    id: string,
  ): Promise<ServiceResponse<ImageResponse>> {
    try {
      const image = await this.prisma.image.update({
        where: { id },
        data: {
          usageCount: { increment: 1 },
        },
        include: {
          category: { select: { name: true } },
          addedBy: { select: { username: true } },
        },
      });

      if (!image) {
        return this.error(
          `❌ Imagem com ID "${id}" não encontrada!`,
          "IMAGE_NOT_FOUND",
        );
      }

      return this.success(
        `✅ Imagem encontrada! (Usada ${image.usageCount} vezes)`,
        this.mapToResponse(image),
      );
    } catch (error) {
      return handlePrismaError(error, {
        P2025: PrismaErrorHandlers.notFound(
          `❌ Imagem com ID "${id}" não encontrada!`,
          "IMAGE_NOT_FOUND",
        ),
      });
    }
  }

  public async listImages(options?: {
    limit?: number;
    orderBy?: "asc" | "desc";
    category?: string;
  }): Promise<ServiceResponse<ImageResponse[]>> {
    try {
      const { limit = 20, orderBy = "desc", category } = options || {};

      const where = category ? { category: { name: category } } : {};

      const images = await this.prisma.image.findMany({
        where,
        orderBy: { addedAt: orderBy },
        take: limit,
        include: {
          category: { select: { name: true } },
          addedBy: { select: { username: true } },
        },
      });

      if (images.length === 0) {
        return this.success("📭 Nenhuma imagem encontrada.", []);
      }

      // Formatar lista
      const formattedList = images
        .map((img, index) => {
          const userTag = img.addedBy?.username || "Desconhecido";
          const dateStr = img.addedAt.toLocaleDateString("pt-BR");
          return `${index + 1}. **${img.title || img.url}**\n   ID: ${img.id} | Cat: ${img.category.name} | Por: ${userTag} | Em: ${dateStr}`;
        })
        .join("\n\n");

      return this.success(
        `📂 **Imagens disponíveis** (${images.length} de ${limit}):\n${formattedList}`,
        images.map((img) => this.mapToResponse(img)),
      );
    } catch (error) {
      return this.error("❌ Erro ao listar imagens", "DATABASE_ERROR");
    }
  }

  private mapToResponse(img: any): ImageResponse {
    return {
      id: img.id,
      url: img.url,
      title: img.title,
      description: img.description,
      categoryId: img.categoryId,
      categoryName: img.category?.name || "Desconhecida",
      addedById: img.addedById,
      addedByUsername: img.addedBy?.username || null,
      tags: img.tags,
      usageCount: img.usageCount,
      addedAt: img.addedAt,
    };
  }
}

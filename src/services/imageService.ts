import { BaseService } from "./base/BaseService.js";
import { ServiceResponse, Translator } from "../types/index.js";
import { Image, PrismaClient } from "@prisma/client";
import {
  normalizeIdOrUrl,
  normalizeImageUrl,
  normalizeTags,
  normalizeString,
  handlePrismaError,
  PrismaErrorHandlers,
  QueryHelpers,
} from "../utils/index.js";

export interface ImageInfo {
  url: string;
  title: string;
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
  categoryId: string;
  addedById: string;
  tags: string | null;
  addedAt: Date;
  category?: {
    name: string;
  };
  addedBy?: {
    username: string;
    avatar: string;
  };
}

export default class ImageService extends BaseService {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  public async addImageUrl(infos: ImageInfo, t: Translator): Promise<ServiceResponse<ImageResponse>> {
    try {
      const normalizedUrl = normalizeImageUrl(infos.url);
      if (!normalizedUrl) {
        return this.error(t("commands.debug.common.invalid_url"), "INVALID_URL");
      }

      const normalizedCategory = normalizeString(infos.category, {
        toLowerCase: true,
        trim: true,
        normalizeDiacritics: true,
        replaceSpaces: " ",
      });

      if (!normalizedCategory) {
        return this.error(t("commands.debug.common.empty_category"), "INVALID_CATEGORY");
      }

      const category = await this.prisma.imagesCategory.findUnique({
        where: { name: normalizedCategory },
      });

      if (!category) {
        return this.error(
          t("commands.debug.common.category_not_found", { category: infos.category }),
          "CATEGORY_NOT_FOUND",
        );
      }

      // Verificar se usuário existe
      const userExists = await this.prisma.user.findUnique({
        where: { id: infos.addedById },
        select: { id: true },
      });

      if (!userExists) {
        return this.error(t("common.errors.user_not_found"), "USER_NOT_FOUND");
      }

      const normalizedTags = infos.tags ? normalizeTags(infos.tags) : null;

      const normalizedTitle = normalizeString(infos.title, {
        toLowerCase: false,
        trim: true,
        normalizeDiacritics: true,
        replaceSpaces: " ",
      });

      const normalizedDescription = infos.description
        ? normalizeString(infos.description, {
            toLowerCase: false,
            trim: true,
            normalizeDiacritics: true,
            replaceSpaces: " ",
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
        t("commands.debug.add-image.success"),
        this.mapToResponse<Image, ImageResponse>(newImage),
      );
    } catch (error) {
      return handlePrismaError(error, {
        P2002: PrismaErrorHandlers.duplicateEntry(
          t("commands.debug.add-image.duplicate_image"),
          "DUPLICATE_IMAGE",
        ),
        P2003: () => this.error(t("prisma.errors.invalid_reference"), "FOREIGN_KEY_CONSTRAINT"),
      });
    }
  }

  public async deleteImage(rawIdOrUrl: string, t: Translator): Promise<ServiceResponse<ImageResponse>> {
    try {
      const idOrUrl = normalizeIdOrUrl(rawIdOrUrl);

      if (idOrUrl.type === "error") {
        return this.error(t("common.errors.invalid_parameter"), "INVALID_PARAMETER");
      }

      let whereParam: { url: string } | { id: string };
      if (idOrUrl.type === "url") {
        whereParam = { url: idOrUrl.text };
      } else {
        whereParam = { id: idOrUrl.text };
      }

      const deleted = await this.prisma.image.delete({
        where: whereParam,
        include: {
          category: { select: { name: true } },
          addedBy: { select: { username: true, avatar: true } },
        },
      });

      return this.success(
        t("commands.debug.delete-image.success"),
        this.mapToResponse<Image, ImageResponse>(deleted),
      );
    } catch (error) {
      return handlePrismaError(error, {
        P2025: PrismaErrorHandlers.notFound(t("commands.debug.common.image_not_found"), "IMAGE_NOT_FOUND"),
      });
    }
  }

  public async listImages(options: {
    limit: number;
    category: string | null;
    orderBy: string;
  }): Promise<ServiceResponse<ImageResponse[]>> {
    try {
      const category = normalizeString(options.category, {
        toLowerCase: true,
        trim: true,
        normalizeDiacritics: true,
        replaceSpaces: true,
      });
      const limit = QueryHelpers.safeLimit(options.limit, 20);
      const orderBy = QueryHelpers.normalizeOrderBy(options.orderBy);

      const where = category ? { category: { name: category } } : {};

      const images = await this.prisma.image.findMany({
        where,
        orderBy: { addedAt: orderBy },
        take: limit,
        include: {
          category: { select: { name: true } },
          addedBy: { select: { username: true, avatar: true } },
        },
      });

      if (images.length === 0) {
        return this.success("📭 Nenhuma imagem encontrada.", []);
      }
      return this.success(
        `Encontradas: ${images.length} imagens.`,
        images.map((img) => this.mapToResponse(img)),
      );
    } catch (error) {
      return this.error("❌ Erro ao listar imagens", "DATABASE_ERROR");
    }
  }
}

import { BaseService } from "./base/BaseService.js";
import { ServiceResponse } from "../types/ServiceResponse.js";
import { handlePrismaError, PrismaErrorHandlers } from "../utils/prisma/errorHandler.js";
import { normalizeString } from "../utils/string/normalizer.js";
import { normalizeIdOrUrl, normalizeImageUrl, normalizeTags } from "../utils/services/imagesHelper.js";
import { Image, PrismaClient } from "@prisma/client";

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

  public async addImageUrl(infos: ImageInfo): Promise<ServiceResponse<ImageResponse>> {
    try {
      const normalizedUrl = normalizeImageUrl(infos.url);
      if (!normalizedUrl) {
        return this.error(`URL inválida!`, "INVALID_URL");
      }

      const normalizedCategory = normalizeString(infos.category, {
        toLowerCase: true,
        trim: true,
        normalizeDiacritics: true,
        replaceSpaces: " ",
      });

      if (!normalizedCategory) {
        return this.error(`❌ Categoria não pode estar vazia!`, "INVALID_CATEGORY");
      }

      const category = await this.prisma.imagesCategory.findUnique({
        where: { name: normalizedCategory },
      });

      if (!category) {
        return this.error(`❌ Categoria "${infos.category}" não existe!`, "CATEGORY_NOT_FOUND");
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
        "Imagem adicionada com sucesso!",
        this.mapToResponse<Image, ImageResponse>(newImage),
      );
    } catch (error) {
      return handlePrismaError(error, {
        P2002: PrismaErrorHandlers.duplicateEntry(
          `Esta imagem já existe no banco de dados!\n` +
            `use **/find-image-by** para informações dessa imagem.`,
          "DUPLICATE_IMAGE",
        ),
        P2003: () =>
          this.error(`Referência inválida (usuário ou categoria não existe)`, "FOREIGN_KEY_CONSTRAINT"),
      });
    }
  }

  public async deleteImage(rawIdOrUrl: string): Promise<ServiceResponse<ImageResponse>> {
    try {
      const idOrUrl = normalizeIdOrUrl(rawIdOrUrl);

      if (idOrUrl.type === "error") {
        return this.error("Parametro inválido! Use uma URL válida ou id", "INVALID_PARAMETER");
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
        `Imagem **${deleted.url}** deletada com sucesso!`,
        this.mapToResponse<Image, ImageResponse>(deleted),
      );
    } catch (error) {
      return handlePrismaError(error, {
        P2025: PrismaErrorHandlers.notFound(`❌ Imagem com não encontrada!`, "IMAGE_NOT_FOUND"),
      });
    }
  }

  public async listImages(options: {
    limit: number;
    category: string | null;
    orderBy: "asc" | "desc";
  }): Promise<ServiceResponse<ImageResponse[]>> {
    try {
      const { limit = 1, category, orderBy } = options || {};

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

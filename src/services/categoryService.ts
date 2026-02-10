import { ServiceResponse } from "../types/ServiceResponse.js";
import { normalizeCategoryName } from "../utils/services/categoryHelper.js";
import { handlePrismaError, PrismaErrorHandlers } from "../utils/prisma/errorHandler.js";
import { BaseService } from "./base/BaseService.js";
import { ImagesCategory, PrismaClient } from "@prisma/client";

export interface CategoryInfo {
  name: string;
  addedById: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  addedById: string;
  addedByName: string;
  addedAt: Date;
}

export default class CategoryService extends BaseService {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  public async addCategory(
    name: string,
    addedById: string,
  ): Promise<ServiceResponse<CategoryResponse>> {
    try {
      const normalizedName = normalizeCategoryName(name);

      const newCategory = await this.prisma.imagesCategory.create({
        data: { name: normalizedName, addedById },
        include: { addedBy: { select: { username: true } } },
      });

      const addedByName = newCategory.addedBy?.username || "Desconhecido";

      return this.success(
        `Categoria **"${newCategory.name}"** criada com sucesso por **"${addedByName}"**`,
        this.mapToResponse<ImagesCategory, CategoryResponse>(newCategory, {
          addedByName: addedByName,
        }),
      );
    } catch (error) {
      return handlePrismaError(error, {
        P2002: PrismaErrorHandlers.duplicateEntry(
          `A categoria "${name}" já existe!`,
          "DUPLICATE_CATEGORY",
        ),
      });
    }
  }

  public async deleteCategory(name: string): Promise<ServiceResponse<{ deletedName: string }>> {
    try {
      const normalizedName = normalizeCategoryName(name);
      const deleted = await this.prisma.imagesCategory.delete({
        where: { name: normalizedName },
      });

      return this.success(`Categoria **"${deleted.name}"** deletada com sucesso`, {
        deletedName: deleted.name,
      });
    } catch (error) {
      return handlePrismaError(error, {
        P2025: PrismaErrorHandlers.notFound(
          `Categoria **"${name}"** não encontrada`,
          "CATEGORY_NOT_FOUND",
        ),
      });
    }
  }

  public async listCategories(options?: {
    limit?: number;
    orderBy?: "asc" | "desc";
  }): Promise<ServiceResponse<Array<CategoryResponse>>> {
    try {
      const { limit = 20, orderBy = "asc" } = options || {};

      const categories = await this.prisma.imagesCategory.findMany({
        orderBy: { name: orderBy },
        select: {
          id: true,
          name: true,
          addedAt: true,
          addedById: true,
          addedBy: { select: { username: true } },
        },
        take: limit,
      });

      if (categories.length === 0) {
        return this.success("📭 Nenhuma categoria encontrada.", []);
      }

      return this.success(
        `Categorias encontradas: ${categories.length}`,
        categories.map((cat) => this.mapToResponse<ImagesCategory, CategoryResponse>(cat)),
      );
    } catch (error) {
      return this.error("Erro ao listar categorias", "DATABASE_ERROR");
    }
  }

  public async categoryExists(id: string): Promise<Boolean> {
    const category = await this.prisma.imagesCategory.findUnique({
      where: { id: id },
      select: { id: true },
    });

    return !!category;
  }

  public async getCategoryIdByName(name: string): Promise<string | undefined> {
    const category = await this.prisma.imagesCategory.findUnique({
      where: { name: name },
      select: { id: true },
    });

    return category?.id;
  }
}

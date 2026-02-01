import { PrismaClient } from "../../generated/prisma/client.js";

export default class ImageService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async addImage(
    url: string,
    userId: string,
    category: string,
    tags?: string[],
  ) {}

  public async addCategory(name: string, addedById: string) {
    try {
      const newCategory = await this.prisma.imagesCategory.create({
        data: { name: name, addedById: addedById },
      });

      return newCategory;
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "P2002") {
        throw new Error(`A categoria "${name}" já existe!`);
      }
      throw error;
    }
  }

  public async listCategories() {
    return await this.prisma.imagesCategory.findMany({
      orderBy: { name: "asc" },
      include: { addedBy: true },
    });
  }

  public async getCategoryById(id: number) {
    return await this.prisma.imagesCategory.findUnique({
      where: { id },
      include: {
        images: {
          // Inclui imagens relacionadas
          take: 10, // Limita a 10 imagens
          orderBy: { addedAt: "desc" },
        },
      },
    });
  }
}

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
    const categorias = await this.prisma.imagesCategory.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        addedAt: true,
        addedBy: {
          select: { username: true },
        },
      },
      take: 20,
    });

    if (categorias.length === 0) {
      return "📭 Nenhuma categoria encontrada.";
    }

    const formattedList = categorias
      .map((cat, index) => {
        const userTag = cat.addedBy?.username || "Desconhecido";
        const dateStr = cat.addedAt.toLocaleDateString("pt-BR");
        return `${index + 1}. **${cat.name}** (ID: ${cat.id}) - Criada por: **${userTag}** - em: **${dateStr}**`;
      })
      .join("\n");

    return `📂 **Categorias disponíveis:**\n${formattedList}`;
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

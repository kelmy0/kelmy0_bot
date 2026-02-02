export function normalizeCategoryName(name: string | null): string {
  if (!name || name.trim().length === 0) {
    throw new Error("Nome da categoria não pode ser vazio");
  }

  // 1. Trim espaços
  // 2. Lowercase
  // 3. Remove espaços extras entre palavras
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

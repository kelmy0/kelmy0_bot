import { normalizeString } from "../string/normalizer.js";

export function normalizeCategoryName(name: string | null): string {
  return normalizeString(name, {
    toLowerCase: true,
    trim: true,
    normalizeDiacritics: true,
    replaceSpaces: " ",
  });
}

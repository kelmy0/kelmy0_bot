export function normalizeString(
  input: string | null,
  options?: {
    toLowerCase?: boolean;
    trim?: boolean;
    normalizeDiacritics?: boolean;
    replaceSpaces?: boolean | string;
  },
): string {
  const {
    toLowerCase = true,
    trim = true,
    normalizeDiacritics = true,
    replaceSpaces = " ",
  } = options || {};

  if (!input || input.trim().length === 0) {
    return "";
  }

  let result = input;

  if (trim) {
    result = result.trim();
  }

  if (toLowerCase) {
    result = result.toLowerCase();
  }

  if (normalizeDiacritics) {
    result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  if (replaceSpaces) {
    const replacement = typeof replaceSpaces === "string" ? replaceSpaces : "";
    result = result.replace(/\s+/g, replacement === "" ? "" : " ");
  }

  return result;
}

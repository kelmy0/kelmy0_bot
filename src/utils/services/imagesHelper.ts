import { normalizeString } from "../string/normalizer.js";

export function normalizeImageUrl(url: string | null): string {
  let normalizedUrl = normalizeString(url, {
    toLowerCase: false,
    trim: true,
    normalizeDiacritics: true,
    replaceSpaces: true,
  });

  try {
    const urlObj = new URL(normalizedUrl);
    if (!["https:"].includes(urlObj.protocol)) {
      return "";
    }

    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
      ".tiff",
      ".tif",
      ".ico",
      ".avif",
      ".heic",
      ".heif",
    ];

    const pathname = urlObj.pathname.toLowerCase();
    const hasImageExtension = imageExtensions.some(
      (ext) =>
        pathname.endsWith(ext) ||
        pathname.includes(`${ext}?`) ||
        pathname.includes(`${ext}&`),
    );

    const isImageFromService =
      // CDNs e serviços de imagem
      urlObj.hostname.includes("cloudinary.com") ||
      urlObj.hostname.includes("imgur.com") ||
      urlObj.hostname.includes("unsplash.com") ||
      urlObj.hostname.includes("pixabay.com") ||
      urlObj.hostname.includes("pexels.com") ||
      urlObj.hostname.includes("images.unsplash.com") ||
      urlObj.hostname.includes("i.imgur.com") ||
      urlObj.hostname.includes("i.pinimg.com");

    return hasImageExtension || isImageFromService ? normalizedUrl : "";
  } catch (error) {
    return "";
  }
}

export function normalizeTags(tagsInput: string | null): string | null {
  if (!tagsInput) return null;

  return tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .map((tag) =>
      normalizeString(tag, {
        toLowerCase: true,
        trim: true,
        normalizeDiacritics: true,
        replaceSpaces: "_",
      }),
    )
    .join(",");
}

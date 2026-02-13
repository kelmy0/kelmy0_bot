import { locales, type TranslationPath } from "../locales/index.js";

export class t {
  /**
   * @param key (ex: "unban.success")
   * @param locale (ex: interaction.locale)
   * @param vars Vars to texts
   */
  static get(
    key: TranslationPath,
    locale: string,
    vars: Record<string, string | number | null | undefined> = {},
  ): string {
    const translations = locales[locale as keyof typeof locales] || locales["en-US"];

    let text = (key as string).split(".").reduce((obj: any, i) => obj?.[i], translations);

    if (typeof text !== "string") return key;

    Object.entries(vars).forEach(([k, v]) => {
      const replacement = v ?? "";

      text = (text as string).replaceAll(`{${k}}`, String(replacement));
    });

    return text;
  }
}

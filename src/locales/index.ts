import ptBR from "./pt-BR.json" with { type: "json" };
import enUS from "./en-US.json" with { type: "json" };

export const locales = {
  "pt-BR": ptBR,
  "en-US": enUS,
} as const;

type Paths<T> = T extends object
  ? { [K in keyof T]: `${Exclude<K, symbol>}${"" | `.${Paths<T[K]>}`}` }[keyof T]
  : never;

export type TranslationPath = Paths<typeof enUS>;

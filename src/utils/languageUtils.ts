import { useLanguageStore, type Language } from "@/lib/languageStore";

export type { Language } from "@/lib/languageStore";

export function getStoredLanguage(): Language {
  return useLanguageStore.getState().language;
}

export function setStoredLanguage(language: Language): void {
  useLanguageStore.getState().setLanguage(language);
}

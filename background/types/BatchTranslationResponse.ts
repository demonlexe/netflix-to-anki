import type { SupportedLocale } from "./SupportedLocale"

export type BatchTranslationResponse = {
  translatedPhrases: object
  locale: SupportedLocale
}

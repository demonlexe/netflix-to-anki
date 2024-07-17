import type { SupportedLocale } from "./SupportedLocale"

export type GeminiSingleRequestResponse = {
  translatedPhrases: Map<string, string>
  locale: SupportedLocale
}

import type { SupportedLocale } from "./SupportedLocale"

export type GeminiBatchRequestResponse =
  | {
      translatedPhrases: object
      locale: SupportedLocale
      error?: never
    }
  | {
      error: string
      translatedPhrases?: never
      locale?: never
    }

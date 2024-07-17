import type { SupportedLocale } from "./SupportedLocale"

export type GeminiBatchRequestResponse = {
  translatedPhrases?: object
  locale?: SupportedLocale
  error?: string
}

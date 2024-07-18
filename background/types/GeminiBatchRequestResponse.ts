export type GeminiBatchRequestResponse =
    | {
          translatedPhrases: Record<string, string>
          error?: never
      }
    | {
          error: string
          translatedPhrases?: never
      }

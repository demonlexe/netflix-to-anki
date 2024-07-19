export type GeminiSingleRequestResponse =
    | {
          translatedPhrases: Map<string, string>
          error?: never
      }
    | {
          error: string
          translatedPhrases?: never
      }

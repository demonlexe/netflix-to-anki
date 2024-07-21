export type GeminiSingleRequestResponse =
    | {
          translatedPhrases: Map<string, string>
          error?: never
      }
    | {
          error: {
              message?: string
              status?: number
          }
          translatedPhrases?: never
      }

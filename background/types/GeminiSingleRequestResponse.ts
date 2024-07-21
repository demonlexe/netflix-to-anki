export type GeminiSingleRequestResponse =
    | {
          translatedPhrases: Record<string, string>
          error?: never
      }
    | {
          error: {
              message?: string
              status?: number
          }
          translatedPhrases?: never
      }

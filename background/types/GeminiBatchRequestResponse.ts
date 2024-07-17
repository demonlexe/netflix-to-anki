export type GeminiBatchRequestResponse =
    | {
          translatedPhrases: object
          error?: never
      }
    | {
          error: string
          translatedPhrases?: never
      }

export type GeminiGetLocaleResponse =
    | {
          locale: string
          error?: never
      }
    | {
          error: string
          locale?: never
      }

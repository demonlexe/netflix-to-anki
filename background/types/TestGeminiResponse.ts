export type TestGeminiResponse =
    | {
          error: string
          response?: never
      }
    | {
          error?: never
          response: string
      }

export type CatchHuluSubtitlesResponse =
    | {
          hulu_sentences: Array<string>
          error?: never
      }
    | {
          error: string
          hulu_sentences?: never
      }
    | {
          error?: never
          hulu_sentences?: never
      }

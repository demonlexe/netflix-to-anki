export type CatchNetflixSubtitlesResponse =
    | {
          netflix_sentences: Array<string>
          error?: never
      }
    | {
          error: string
          netflix_sentences?: never
      }
    | {
          error?: never
          netflix_sentences?: never
      }

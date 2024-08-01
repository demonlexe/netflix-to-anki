export type CatchSiteSubtitlesResponse =
    | {
          site_sentences: Array<string>
          error?: never
      }
    | {
          error: string
          site_sentences?: never
      }
    | {
          error?: never
          site_sentences?: never
      }

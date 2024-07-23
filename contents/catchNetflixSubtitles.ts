import { sendToBackground } from "@plasmohq/messaging"

import type { CatchNetflixSubtitlesRequest } from "~background/types/CatchNetflixSubtitlesRequest"
import type { CatchNetflixSubtitlesResponse } from "~background/types/CatchNetflixSubtitlesResponse"
import batchTranslateSubtitles from "~contents/batchTranslateSubtitles"
import extractIdFromUrl from "~utils/functions/extractMovieFromNetflixUrl"
import resetNetflixContext from "~utils/functions/resetNetflixContext"
import updateUntranslatedSentences from "~utils/functions/updateUntranslatedSentences"
import { getData } from "~utils/localData"

export default function catchNetflixSubtitles() {
    window.addEventListener("message", async (event) => {
        if (event.source !== window) return

        if (!window?.location?.href?.includes("netflix.com/watch")) {
            // don't care about subtitles on main netflix page
            return
        }
        if (event.data.type && event.data.type === "NETWORK_REQUEST") {
            const response: CatchNetflixSubtitlesResponse =
                await sendToBackground({
                    name: "catch_netflix_subtitles",
                    body: {
                        message: event.data
                    } as CatchNetflixSubtitlesRequest
                })
            if (response.error) {
                console.error(
                    "Error getting Netflix subtitles: ",
                    response.error
                )
            } else if (response.netflix_sentences) {
                resetNetflixContext()
                const showId = extractIdFromUrl(window.location.href)
                const targetLanguage = await getData("TARGET_LANGUAGE")
                updateUntranslatedSentences(
                    showId,
                    targetLanguage,
                    response.netflix_sentences
                )
                window.allNetflixSentences = response.netflix_sentences
                console.log(
                    "This movie/episode's sentences: #",
                    window.untranslatedSentencesCache.length
                )
                batchTranslateSubtitles(showId, targetLanguage)
            }
        }
    })
}

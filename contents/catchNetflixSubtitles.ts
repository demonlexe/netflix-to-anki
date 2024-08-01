import { sendToBackground } from "@plasmohq/messaging"

import type { CatchNetflixSubtitlesRequest } from "~background/types/CatchNetflixSubtitlesRequest"
import type { CatchNetflixSubtitlesResponse } from "~background/types/CatchNetflixSubtitlesResponse"
import batchTranslateSubtitles from "~contents/batchTranslateSubtitles"
import extractIdFromUrl from "~utils/functions/extractIdFromUrl"
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
                const showId = extractIdFromUrl(window.location.href)
                const targetLanguage = await getData("TARGET_LANGUAGE")
                if (!targetLanguage) return // missing setting

                // Already translating for this show and language, which means we have already caught the subtitles for this episode.
                // Thus, store result for the next episode!
                if (
                    window.cachedSiteSentences.length > 0 &&
                    showId === window.currentShowId
                ) {
                    window.cachedNextEpisodeSiteSentences =
                        response.netflix_sentences
                    window.cachedSiteSentences = []
                } else {
                    window.cachedNextEpisodeSiteSentences = []
                    window.cachedSiteSentences = response.netflix_sentences
                }

                batchTranslateSubtitles(
                    window.untranslatedSentencesCache?.[showId]?.[
                        targetLanguage
                    ] && showId === window.currentShowId
                        ? "" + (Number(showId.trim()) + 1)
                        : showId,
                    targetLanguage,
                    response.netflix_sentences,
                    0
                )
            }
        }
    })
}

import { sendToBackground } from "@plasmohq/messaging"

import type { CatchHuluSubtitlesRequest } from "~background/types/CatchHuluSubtitlesRequest"
import type { CatchHuluSubtitlesResponse } from "~background/types/CatchHuluSubtitlesResponse"
import batchTranslateSubtitles from "~contents/batchTranslateSubtitles"
import extractIdFromUrl from "~utils/functions/extractMovieFromNetflixUrl"
import { getData } from "~utils/localData"

export default function catchHuluSubtitles() {
    window.addEventListener("message", async (event) => {
        if (event.source !== window) return

        if (!window?.location?.href?.includes("hulu.com/watch")) {
            // don't care about subtitles on main hulu page
            return
        }
        if (
            event.data.type &&
            event.data.type === "NETWORK_REQUEST" &&
            event.data.url.match(/.ttml$/)
        ) {
            console.log(
                "CAUGHT SUBTITLES: ",
                event.data,
                event.data.url.match(/.ttml$/)
            )
            const response: CatchHuluSubtitlesResponse = await sendToBackground(
                {
                    name: "catch_hulu_subtitles",
                    body: {
                        message: event.data
                    } as CatchHuluSubtitlesRequest
                }
            )
            if (response.error) {
                console.error("Error getting Hulu subtitles: ", response.error)
            } else if (response.hulu_sentences) {
                console.log("SENTENCES: ", response.hulu_sentences)
                const showId = extractIdFromUrl(window.location.href)
                const targetLanguage = await getData("TARGET_LANGUAGE")
                if (!targetLanguage) return // missing setting

                // Already translating for this show and language, which means we have already caught the subtitles for this episode.
                // Thus, store result for the next episode!
                if (
                    window.cachedNetflixSentences.length > 0 &&
                    showId === window.currentShowId
                ) {
                    window.cachedNextEpisodeNetflixSentences =
                        response.hulu_sentences
                    window.cachedNetflixSentences = []
                } else {
                    window.cachedNextEpisodeNetflixSentences = []
                    window.cachedNetflixSentences = response.hulu_sentences
                }

                batchTranslateSubtitles(
                    window.untranslatedSentencesCache?.[showId]?.[
                        targetLanguage
                    ] && showId === window.currentShowId
                        ? "" + (Number(showId.trim()) + 1)
                        : showId,
                    targetLanguage,
                    response.hulu_sentences,
                    0
                )
            }
        }
    })
}

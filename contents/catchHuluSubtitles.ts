import { sendToBackground } from "@plasmohq/messaging"

import type { CatchSiteSubtitlesRequest } from "~background/types/CatchSiteSubtitlesRequest"
import type { CatchSiteSubtitlesResponse } from "~background/types/CatchSiteSubtitlesResponse"
import batchTranslateSubtitles from "~contents/batchTranslateSubtitles"
import extractIdFromUrl from "~utils/functions/extractIdFromUrl"
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
            const response: CatchSiteSubtitlesResponse = await sendToBackground(
                {
                    name: "catch_site_subtitles",
                    body: {
                        message: event.data
                    } as CatchSiteSubtitlesRequest
                }
            )
            if (response.error) {
                console.error("Error getting Hulu subtitles: ", response.error)
            } else if (response.site_sentences) {
                console.log("SENTENCES: ", response.site_sentences)
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
                        response.site_sentences
                    window.cachedSiteSentences = []
                } else {
                    window.cachedNextEpisodeSiteSentences = []
                    window.cachedSiteSentences = response.site_sentences
                }

                batchTranslateSubtitles(
                    window.untranslatedSentencesCache?.[showId]?.[
                        targetLanguage
                    ] && showId === window.currentShowId
                        ? "" + (Number(showId.trim()) + 1)
                        : showId,
                    targetLanguage,
                    response.site_sentences,
                    0
                )
            }
        }
    })
}

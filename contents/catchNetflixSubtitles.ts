import { sendToBackground } from "@plasmohq/messaging"

import type { CatchNetflixSubtitlesRequest } from "~background/types/CatchNetflixSubtitlesRequest"
import type { CatchNetflixSubtitlesResponse } from "~background/types/CatchNetflixSubtitlesResponse"
import batchTranslateSubtitles from "~contents/batchTranslateSubtitles"
import resetNetflixContext from "~utils/functions/resetNetflixContext"

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
                window.untranslatedSentences = response.netflix_sentences
                window.allNetflixSentences = response.netflix_sentences
                console.log(
                    "This movie/episode's sentences: #",
                    window.untranslatedSentences.length
                )
                batchTranslateSubtitles()
            }
        }
    })
}

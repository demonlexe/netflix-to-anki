import { sendToBackground } from "@plasmohq/messaging"

import type { CatchNetflixSubtitlesRequest } from "~background/types/CatchNetflixSubtitlesRequest"
import type { CatchNetflixSubtitlesResponse } from "~background/types/CatchNetflixSubtitlesResponse"
import batchTranslateSubtitles from "~contents/batchTranslateSubtitles"

export default function catchNetflixSubtitles() {
    window.addEventListener("message", async (event) => {
        if (event.source !== window) return
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
                window.batchTranslateRetries = 0
                window.untranslatedSentences = response.netflix_sentences
                console.log(
                    "Window's untranslated sentences: #",
                    window.untranslatedSentences.length
                )
                batchTranslateSubtitles()
            }
        }
    })
}

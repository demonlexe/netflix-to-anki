import SRTParser from "srt-parser-2"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import type { CatchSiteSubtitlesResponse } from "~background/types/CatchSiteSubtitlesResponse"
import type { CatchVTTSiteSubtitlesRequest } from "~background/types/CatchVTTSiteSubtitlesRequest"
import logDev from "~utils/functions/logDev"

const handler: PlasmoMessaging.MessageHandler<
    CatchVTTSiteSubtitlesRequest,
    CatchSiteSubtitlesResponse
> = async (req, res) => {
    const { message } = req.body
    logDev("MSG RECEIVED", req.body.message, req.body)

    if (typeof message?.response !== "string") {
        logDev(
            "Invalid response format. Expected string, got:",
            typeof message?.response
        )
        return res.send({})
    }

    if (!message.response.trim()) {
        logDev("Received an empty SRT string. No subtitles found.")
        return res.send({})
    }

    // Create a new SRT parser instance
    const parser = new SRTParser()
    const subtitles = parser.fromSrt(message.response)

    const allSentencesSet = new Set<string>()

    logDev("Extracted subtitle data:", subtitles)

    subtitles.forEach((subtitle) => {
        const text = subtitle.text?.trim()
        if (text) {
            // Replace new lines with <br/> and combine the full sentence
            const combinedText = text.replace(/\n/g, "<br/>")
            allSentencesSet.add(combinedText)
        }
    })

    logDev("All unique sentences:", allSentencesSet)
    const allSentencesArray: string[] = Array.from(allSentencesSet)
    res.send({ site_sentences: allSentencesArray })
}

export default handler

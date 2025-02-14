import type { PlasmoMessaging } from "@plasmohq/messaging"

import type { CatchSiteSubtitlesResponse } from "~background/types/CatchSiteSubtitlesResponse"
import type { CatchVTTSiteSubtitlesRequest } from "~background/types/CatchVTTSiteSubtitlesRequest"
import parseVTT from "~background/utils/functions/parseVTT"
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
        logDev("Received an empty VTT string. No subtitles found.")
        return res.send({})
    }

    const grouping = parseVTT(message.response)
    const allSentencesSet = new Set<string>()

    logDev("Extracted subtitle grouping:", grouping)

    for (const key in grouping) {
        grouping[key].forEach((sentence: string) => {
            allSentencesSet.add(sentence?.trim())
        })
    }

    logDev("All unique sentences:", allSentencesSet)
    const allSentencesArray: string[] = Array.from(allSentencesSet)
    res.send({ site_sentences: allSentencesArray })
}

export default handler

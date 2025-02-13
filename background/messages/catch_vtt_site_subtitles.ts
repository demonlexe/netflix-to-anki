import type { PlasmoMessaging } from "@plasmohq/messaging"

import type { CatchSiteSubtitlesResponse } from "~background/types/CatchSiteSubtitlesResponse"
import type { CatchVTTSiteSubtitlesRequest } from "~background/types/CatchVTTSiteSubtitlesRequest"
import logDev from "~utils/functions/logDev"

const vttRegex =
    /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})(?: .*?)?\n+([\s\S]*?)(?=\n\n|\n\d{2}:\d{2}:\d{2}\.\d{3} -->|\Z)/g

const parseVTT = (vttText: string): Record<string, string[]> => {
    if (!vttText.trim()) {
        logDev("parseVTT received an empty or invalid string!")
        return {}
    }

    logDev("Parsing VTT content:\n", vttText) // Log the full text before parsing
    const matches = [...vttText.matchAll(vttRegex)]
    const grouping: Record<string, string[]> = {}

    for (const match of matches) {
        const startTime = match[1]
        const textContent = match[3]?.trim().replace(/\n/g, " ")

        if (!textContent) continue

        if (grouping[startTime]) {
            grouping[startTime].push(textContent)
        } else {
            grouping[startTime] = [textContent]
        }
    }
    return grouping
}

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

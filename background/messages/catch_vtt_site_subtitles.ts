import type { PlasmoMessaging } from "@plasmohq/messaging"

import type { CatchSiteSubtitlesResponse } from "~background/types/CatchSiteSubtitlesResponse"
import type { CatchVTTSiteSubtitlesRequest } from "~background/types/CatchVTTSiteSubtitlesRequest"
import logDev from "~utils/functions/logDev"

const vttRegex =
    /([0-9:.]+) --> ([0-9:.]+)(?: .*)?\n([^-].*?(?:\n(?!\d{2}:\d{2}\.\d{3} -->).*)*)/gs

const parseVTT = (vttText: string): Record<string, string[]> => {
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
    if (message?.response?.length > 0) {
        logDev("Caught site subtitles: ", message)

        const grouping = parseVTT(message?.response)
        const allSentencesSet = new Set<string>()
        logDev("Grouping: ", grouping)

        for (const key in grouping) {
            grouping[key].forEach((sentence: string) => {
                allSentencesSet.add(sentence?.trim())
            })
        }

        console.warn("All setnences: ", allSentencesSet)
        const allSentencesArray: string[] = Array.from(allSentencesSet)
        res.send({ site_sentences: allSentencesArray })
    } else {
        return res.send({}) // return empty object if no subtitles are found
    }
}

export default handler

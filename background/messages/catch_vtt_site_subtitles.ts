import type { PlasmoMessaging } from "@plasmohq/messaging"

import type { CatchSiteSubtitlesRequest } from "~background/types/CatchSiteSubtitlesRequest"
import type { CatchSiteSubtitlesResponse } from "~background/types/CatchSiteSubtitlesResponse"
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
    CatchSiteSubtitlesRequest,
    CatchSiteSubtitlesResponse
> = async (req, res) => {
    const { message } = req.body
    if (message.response?.length > 0) {
        logDev("Caught site subtitles: ", message)

        const grouping = parseVTT(message.response)
        const allSentencesSet = new Set<string>()

        for (const key in grouping) {
            grouping[key].forEach((sentence: string) => {
                allSentencesSet.add(sentence?.trim())
            })
        }

        const allSentencesArray: string[] = Array.from(allSentencesSet)
        res.send({ site_sentences: allSentencesArray })
    } else {
        return res.send({}) // return empty object if no subtitles are found
    }
}

export default handler

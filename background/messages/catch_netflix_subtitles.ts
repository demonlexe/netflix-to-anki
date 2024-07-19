import { parseString } from "xml2js"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import { type CatchNetflixSubtitlesRequest } from "~background/types/CatchNetflixSubtitlesRequest"
import type { CatchNetflixSubtitlesResponse } from "~background/types/CatchNetflixSubtitlesResponse"
import getAllCachedTranslations from "~utils/functions/getAllCachedTranslations"

type XMLText = {
    $: any
    _?: string
    span?: XMLText
}

const getXMLTextContent = (text: XMLText) => {
    return (
        text.span && text.span[0]
            ? (text._ ?? "") + " " + getXMLTextContent(text.span[0])
            : text._ ?? ""
    ).trim()
}

const handler: PlasmoMessaging.MessageHandler<
    CatchNetflixSubtitlesRequest,
    CatchNetflixSubtitlesResponse
> = async (req, res) => {
    const { message } = req.body
    if (
        message.url.includes("?o") &&
        message.url.includes("nflxvideo.net") &&
        message.response?.length > 0
    ) {
        parseString(message.response, async function (err, result) {
            if (err) {
                console.error("Error parsing XML: ", err)
                return res.send({ error: "Error parsing XML" })
            }
            const allText: XMLText[] = result.tt.body?.[0]?.div?.[0]?.p
            const grouping = {}
            allText.forEach((text: XMLText) => {
                const textContent = getXMLTextContent(text)
                if (grouping[text.$.begin]) {
                    grouping[text.$.begin].push(textContent)
                } else {
                    grouping[text.$.begin] = [textContent]
                }
            })
            const allSentencesSet = new Set<string>()
            for (const key in grouping) {
                const sentences = grouping[key]
                sentences.forEach((sentence: string) => {
                    allSentencesSet.add(sentence)
                })
            }
            const allSentencesArray: string[] = Array.from(allSentencesSet)
            res.send({ netflix_sentences: allSentencesArray })
        })
    } else {
        return res.send({}) // return empty object if the URL does not have subtitles
    }
}

export default handler

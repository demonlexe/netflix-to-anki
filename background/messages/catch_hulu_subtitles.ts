import { parseString } from "xml2js"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import { type CatchHuluSubtitlesRequest } from "~background/types/CatchHuluSubtitlesRequest"
import type { CatchHuluSubtitlesResponse } from "~background/types/CatchHuluSubtitlesResponse"
import replaceXmlBreakTags from "~background/utils/functions/replaceXmlBreakTags"
import { BREAK_TAG_RENAME } from "~utils/constants"

type XMLText = {
    $: any
    _?: string
    span?: XMLText[]
}

const breakTagRegex = new RegExp(`${BREAK_TAG_RENAME}`, "g")

function getXMLTextContent(text: XMLText): string[] {
    const theseStrings: string[] = [text._?.trim() ?? ""]

    if (text.span && text.span[0]) {
        getXMLTextContent(text.span[0]).forEach((spanText: string) => {
            theseStrings.push(spanText)
        })
    }

    const toReturn = []
    for (const string of theseStrings) {
        if (string) {
            toReturn.push(string.replace(breakTagRegex, "<br/>"))
        }
    }
    return toReturn
}

const handler: PlasmoMessaging.MessageHandler<
    CatchHuluSubtitlesRequest,
    CatchHuluSubtitlesResponse
> = async (req, res) => {
    const { message } = req.body
    if (message.url.includes(".ttml") && message.response?.length > 0) {
        const responseReplaced = replaceXmlBreakTags(message.response)
        parseString(
            responseReplaced,
            {
                trim: true
            },
            async function (err, result) {
                if (err) {
                    console.error("Error parsing XML: ", err)
                    return res.send({ error: "Error parsing XML" })
                }
                const allText: XMLText[] = result.tt.body?.[0]?.div.map(
                    (div: any) => div?.p?.[0]
                )
                const grouping: Record<string, string[]> = {}
                allText.forEach((text: XMLText) => {
                    const textContent = getXMLTextContent(text)
                    if (grouping[text.$.begin]) {
                        grouping[text.$.begin].push(...textContent)
                    } else {
                        grouping[text.$.begin] = [...textContent]
                    }
                })
                const allSentencesSet = new Set<string>()
                for (const key in grouping) {
                    const sentences = grouping[key]
                    sentences.forEach((sentence: string) => {
                        allSentencesSet.add(sentence?.trim())
                    })
                }
                const allSentencesArray: string[] = Array.from(allSentencesSet)
                res.send({ hulu_sentences: allSentencesArray })
            }
        )
    } else {
        return res.send({}) // return empty object if the URL does not have subtitles
    }
}

export default handler

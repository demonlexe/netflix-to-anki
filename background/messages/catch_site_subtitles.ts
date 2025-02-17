import { parseString } from "xml2js"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import { type CatchSiteSubtitlesRequest } from "~background/types/CatchSiteSubtitlesRequest"
import type { CatchSiteSubtitlesResponse } from "~background/types/CatchSiteSubtitlesResponse"
import logDev from "~utils/functions/logDev"

type XMLText = {
    $: any
    _?: string
    span?: XMLText[]
    br?: ""
}

function getXMLTextContent(text: XMLText): string {
    const theseStrings: string[] = [text._?.trim() ?? ""]

    if (text.span && text.span[0]) {
        // // theseStrings.push(getXMLTextContent(text.span[0]))
        // theseStrings.unshift(getXMLTextContent(text.span[0]))
        // // loop all children of text.span

        for (let i = 0; i < text.span.length; i++) {
            theseStrings.push(getXMLTextContent(text.span[i]))
            if (text.br && i == 0) {
                theseStrings.push("<br/>")
            }
        }
    }

    let toReturn = ""
    for (const string of theseStrings) {
        if (string) {
            toReturn += string
        }
    }
    return toReturn
}

const handler: PlasmoMessaging.MessageHandler<
    CatchSiteSubtitlesRequest,
    CatchSiteSubtitlesResponse
> = async (req, res) => {
    const { message } = req.body
    if (message.response?.length > 0) {
        logDev("Caught site subtitles: ", message)
        parseString(
            message.response,
            {
                trim: true
            },
            async function (err, result) {
                logDev("PARSE RESULT: ", result)
                if (err) {
                    console.error("Error parsing XML: ", err)
                    return res.send({ error: "Error parsing XML" })
                }
                // might contain multiple divs
                const parentDiv = result.tt.body?.[0]?.div
                const allText: XMLText[] =
                    parentDiv.length > 1
                        ? parentDiv.map((div: any) => div?.p?.[0])
                        : parentDiv?.[0]?.p
                const grouping: Record<string, string[]> = {}
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
                        allSentencesSet.add(sentence?.trim())
                    })
                }
                const allSentencesArray: string[] = Array.from(allSentencesSet)
                res.send({ site_sentences: allSentencesArray })
            }
        )
    } else {
        return res.send({}) // return empty object if the URL does not have subtitles
    }
}

export default handler

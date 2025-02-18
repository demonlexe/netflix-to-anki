import { parse } from "xamel"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import { type CatchSiteSubtitlesRequest } from "~background/types/CatchSiteSubtitlesRequest"
import type { CatchSiteSubtitlesResponse } from "~background/types/CatchSiteSubtitlesResponse"
import logDev from "~utils/functions/logDev"

type Tag = {
    children: (Tag | string)[]
    name: string
}

function getXMLTextContentFromTag(tag: Tag): string {
    const theseStrings: string[] = []

    // loop children of tag
    for (let i = 0; i < tag.children.length; i++) {
        const child = tag.children[i]
        if (typeof child === "string") {
            theseStrings.push(child)
        } else if (child.name === "br") {
            theseStrings.push("<br/>")
        } else {
            theseStrings.push(getXMLTextContentFromTag(child))
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
    const { message, usingSite } = req.body
    if (message.response?.length > 0) {
        logDev("Caught site subtitles: ", message)
        parse(message.response, (err, xml) => {
            if (!err) {
                if (err) {
                    console.error("Error parsing XML: ", err)
                    return res.send({ error: "Error parsing XML" })
                }
                const arrayOfRows: { children: Tag[] } =
                    usingSite === "netflix"
                        ? xml.$("tt/body").eq(0).$("div").eq(0)
                        : xml.$("tt/body").eq(0)
                const allText = arrayOfRows.children
                logDev("Children: ", allText)
                const allSentencesSet = new Set<string>()
                allText.forEach((text: Tag) => {
                    const textContent = getXMLTextContentFromTag(text)
                    allSentencesSet.add(textContent?.trim())
                })
                const allSentencesArray: string[] = Array.from(allSentencesSet)
                logDev("All sentences: ", allSentencesArray)
                res.send({ site_sentences: allSentencesArray })
            }
        })
    } else {
        return res.send({}) // return empty object if the URL does not have subtitles
    }
}

export default handler

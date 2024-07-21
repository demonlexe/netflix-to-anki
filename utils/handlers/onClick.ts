import $ from "jquery"

import { sendToBackground } from "@plasmohq/messaging"

import type {
    GeminiSingleRequestBody,
    GeminiSingleRequestResponse
} from "~background/types"
import extractTextFromHTML from "~utils/functions/extractTextFromHtml"
import getLiveElement from "~utils/functions/getLiveElement"
import translatePhraseLocal from "~utils/functions/translatePhraseLocal"
import updateNeedToStudy from "~utils/functions/updateNeedToStudy"
import updateTranslations from "~utils/functions/updateTranslations"

// Translate all the text currently on the screen and update the cache.
// Return "true" if it should play the video.
export default async function onClick() {
    // get array of all texts stored in .player-timedtext-text-container
    const allTexts: { container: JQuery<HTMLElement>; text: string }[] = []
    $(".player-timedtext-text-container").each((_, el) => {
        const liveElement = getLiveElement("", $(el))
        console.log("Live Element: ", liveElement)
        const textOfElement = extractTextFromHTML($(liveElement).html())
        allTexts.push({ container: $(el), text: textOfElement })
    })

    console.log("All texts!: ", allTexts)
    // if there is no need to do the grouped translation, return early
    if (allTexts.length === 0) return false

    const localTranslateResults = []
    allTexts.forEach((curr) => {
        const tryTranslateLocal = translatePhraseLocal(
            curr.text,
            curr.container
        )
        localTranslateResults.push(tryTranslateLocal)
    })

    if (localTranslateResults.includes(null)) {
        const openResult: GeminiSingleRequestResponse = await sendToBackground({
            name: "gemini_translate",
            body: {
                phrases: allTexts.map((elem) => elem.text)
            } as GeminiSingleRequestBody
        })
        console.log("On-Click Untranslated API Result: ", openResult)
        if (openResult.error) {
            console.error("Error while translating: ", openResult.error)
            return true
        }
        const translatedTexts: string[] = []
        allTexts.forEach((curr) => {
            updateTranslations(
                curr.text,
                openResult.translatedPhrases[curr.text]
            )
            translatedTexts.push(openResult.translatedPhrases[curr.text])
        })
        const text1 = allTexts.join(" ").replace(/\s+/g, " ") // remove extra spaces
        const text2 = translatedTexts.join(" ").replace(/\s+/g, " ") // remove extra spaces
        updateNeedToStudy(text1, text2)
        return false
    } else {
        return localTranslateResults.includes(false) ? false : true // prioritize not playing over playing
    }
}

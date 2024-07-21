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
    const allTexts: string[] = []
    $(".player-timedtext-text-container").each((_, el) => {
        const liveElement = getLiveElement("", $(el))
        console.log("Live Element: ", liveElement)
        const textOfElement = extractTextFromHTML($(liveElement).html())
        allTexts.push(textOfElement)
    })

    console.log("All texts!: ", allTexts)
    // if there is no need to do the grouped translation, return early
    if (allTexts.length === 0) return false
    if (allTexts.length === 1) {
        const tryTranslateLocal = translatePhraseLocal(allTexts[0])
        if (tryTranslateLocal !== null) return tryTranslateLocal
    }

    const openResult: GeminiSingleRequestResponse = await sendToBackground({
        name: "gemini_translate",
        body: { phrases: allTexts } as GeminiSingleRequestBody
    })
    console.log("Right Click API Result: ", openResult)
    const translatedTexts: string[] = []
    allTexts.forEach((currentText) => {
        updateTranslations(
            currentText,
            openResult.translatedPhrases[currentText]
        )
        translatedTexts.push(openResult.translatedPhrases[currentText])
    })
    const text1 = allTexts.join(" ").replace(/\s+/g, " ") // remove extra spaces
    const text2 = translatedTexts.join(" ").replace(/\s+/g, " ") // remove extra spaces
    updateNeedToStudy(text1, text2)
    return false
}

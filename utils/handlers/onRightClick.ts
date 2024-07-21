import $ from "jquery"

import { sendToBackground } from "@plasmohq/messaging"

import type {
    GeminiSingleRequestBody,
    GeminiSingleRequestResponse
} from "~background/types"
import translateOnePhraseLocal from "~utils/functions/translateOnePhraseLocal"
import updateNeedToStudy from "~utils/functions/updateNeedToStudy"
import updateTranslations from "~utils/functions/updateTranslations"

// Translate all the text currently on the screen and update the cache.
// Return "true" if it should play the video.
export default async function onRightClick() {
    // get array of all texts stored in .player-timedtext-text-container
    const allTexts: string[] = []
    $(".player-timedtext-text-container").each((_, el) => {
        allTexts.push($(el).text()?.trim())
    })

    // if there is no need to do the grouped translation, return early
    if (allTexts.length === 0) return false
    if (allTexts.length === 1) {
        const tryTranslateLocal = translateOnePhraseLocal(allTexts[0])
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

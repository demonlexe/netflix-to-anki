import $ from "jquery"

import { sendToBackground } from "@plasmohq/messaging"

import type {
    GeminiSingleRequestBody,
    GeminiSingleRequestResponse
} from "~background/types"
import translateOnePhraseLocal from "~utils/functions/translateOnePhraseLocal"
import updateNeedToStudy from "~utils/functions/updateNeedToStudy"
import updateTranslations from "~utils/functions/updateTranslations"

// Given the element, translate the text and update the cache.
// Return "true" if it should play the video.
export default async function onLeftClick(elem: Element) {
    const currentText = $(elem).text()?.trim()
    if (!currentText || currentText.length === 0) return false
    const tryTranslateLocal = translateOnePhraseLocal(currentText)
    if (tryTranslateLocal !== null) return tryTranslateLocal

    const openResult: GeminiSingleRequestResponse = await sendToBackground({
        name: "gemini_translate",
        body: { phrases: [currentText] } as GeminiSingleRequestBody
    })
    // Return early and play the video if there is no translation
    if (
        !openResult ||
        !openResult.translatedPhrases ||
        Object.keys(openResult.translatedPhrases).length <= 0
    )
        return true
    console.log("Single Click API Result: ", openResult)
    const transText =
        openResult.translatedPhrases[currentText] ??
        openResult.translatedPhrases[currentText.trim()]
    updateTranslations(currentText, transText)
    updateNeedToStudy(currentText, transText)
    return false
}

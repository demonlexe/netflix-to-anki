import $ from "jquery"

import { sendToBackground } from "@plasmohq/messaging"

import type {
    GeminiSingleRequestBody,
    GeminiSingleRequestResponse
} from "~background/types"
import { SITE_WATCHERS } from "~utils/constants"
import extractTextFromHTML from "~utils/functions/extractTextFromHtml"
import getLiveElement from "~utils/functions/getLiveElement"
import logDev from "~utils/functions/logDev"
import translatePhraseLocal from "~utils/functions/translatePhraseLocal"
import updateNeedToStudy from "~utils/functions/updateNeedToStudy"
import updateTranslations from "~utils/functions/updateTranslations"

// Translate all the text currently on the screen and update the cache.
export default async function onClick() {
    const { captionElement, captionParentElement } =
        SITE_WATCHERS[window.usingSite]
    const allTexts: { container: JQuery<HTMLElement>; text: string }[] = []
    console.log("RES: ", $(`${captionParentElement} ${captionElement}`))
    $(`${captionParentElement} ${captionElement}`).each((_, el) => {
        const liveElement = getLiveElement("", $(el))
        console.log("LIVE: ", liveElement)
        const textOfElement = extractTextFromHTML($(liveElement).html())
        allTexts.push({ container: $(el), text: textOfElement })
    })

    logDev("All texts!: ", allTexts)
    // if there is no need to do the grouped translation, return early
    if (allTexts.length === 0) return

    const localTranslateResults: { text: string; isYellow: boolean }[] = []
    for (const curr of allTexts) {
        const tryTranslateLocal = await translatePhraseLocal(
            curr.text,
            curr.container
        )
        localTranslateResults.push(tryTranslateLocal)
    }

    const allTextsAsString = allTexts
        .map((obj) => obj.text)
        .join(" ")
        .replace(/\s+/g, " ") // remove extra spaces
    if (localTranslateResults.some((elem) => elem.text === null)) {
        const openResult: GeminiSingleRequestResponse = await sendToBackground({
            name: "gemini_translate",
            body: {
                phrases: allTexts.map((elem) => elem.text),
                targetLanguage: window.polledSettings.TARGET_LANGUAGE
            } as GeminiSingleRequestBody
        })
        logDev("On-Click Untranslated API Result: ", openResult)
        if (openResult.error) {
            console.error("Error while translating: ", openResult.error)
            return
        }
        const translatedTexts: string[] = []
        allTexts.forEach((curr) => {
            updateTranslations(
                curr.text,
                openResult.translatedPhrases[curr.text]
            )
            translatedTexts.push(openResult.translatedPhrases[curr.text])
        })

        const translatedTextsAsString = translatedTexts
            .join(" ")
            .replace(/\s+/g, " ") // remove extra spaces
        updateNeedToStudy(allTextsAsString, translatedTextsAsString)
    } else {
        const localTranslatedTextsAsString = localTranslateResults
            .map((elem) => elem.text)
            .join(" ")
            .replace(/\s+/g, " ") // remove extra spaces
        updateNeedToStudy(allTextsAsString, localTranslatedTextsAsString)
        // true plays the video
        // false keeps default behavior of on-click
    }
}

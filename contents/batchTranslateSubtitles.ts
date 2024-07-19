import { sendToBackground } from "@plasmohq/messaging"

import type { GeminiSingleRequestBody } from "~background/types"
import type { GeminiGetLocaleRequest } from "~background/types/GeminiGetLocaleRequest"
import type { GeminiGetLocaleResponse } from "~background/types/GeminiGetLocaleResponse"
import { BATCH_SIZE, BATCH_TRANSLATE_RETRY_INTERVAL } from "~utils/constants"
import getAllCachedTranslations from "~utils/functions/getAllCachedTranslations"
import setAllCachedTranslations from "~utils/functions/setAllCachedTranslations"
import { getData } from "~utils/localData"

export default async function batchTranslateSubtitles() {
    const [TARGET_LANGUAGE, NATIVE_LANGUAGE] = await Promise.all([
        getData("API_KEY"),
        getData("TARGET_LANGUAGE"),
        getData("NATIVE_LANGUAGE")
    ])

    const collectedSentences = []

    // Figure out what has already been translated.
    const storedTranslations = await getAllCachedTranslations()
    const alreadyTranslatedSentences =
        storedTranslations &&
        typeof storedTranslations === "object" &&
        Object.keys(storedTranslations).length > 1
            ? Object.keys(storedTranslations)
            : null

    // Split into BATCH_SIZE sentences from the window.untranslatedSentences
    const dummyArrayForLocale =
        window.untranslatedSentences.length > BATCH_SIZE / 2
            ? window.untranslatedSentences.slice(0, BATCH_SIZE / 2)
            : alreadyTranslatedSentences.slice(0, BATCH_SIZE / 2)
    const sentencesLocale: GeminiGetLocaleResponse = await sendToBackground({
        name: "gemini_get_locale",
        body: {
            targetLanguage: TARGET_LANGUAGE,
            sentences: dummyArrayForLocale
        } as GeminiGetLocaleRequest
    })

    const allPromises = []

    for (let i = 0; i < window.untranslatedSentences.length; i += BATCH_SIZE) {
        allPromises.push(
            sendToBackground({
                name: "gemini_translate",
                body: {
                    phrases: window.untranslatedSentences.slice(
                        i,
                        i + BATCH_SIZE
                    ),
                    sentencesLocale: sentencesLocale.locale
                } as GeminiSingleRequestBody
            })
        )
    }
    await Promise.all(allPromises).then((allResponses) => {
        allResponses.forEach((response) => {
            if (response.translatedPhrases) {
                for (const key in response.translatedPhrases) {
                    collectedSentences[key] = response.translatedPhrases[key]
                }
            }
        })
        console.log("All sentences translated: ", collectedSentences)
        try {
            setAllCachedTranslations(collectedSentences)
        } catch (e) {
            console.error("Error setting translations: ", e)
        }
    })

    setTimeout(() => batchTranslateSubtitles(), BATCH_TRANSLATE_RETRY_INTERVAL)
}

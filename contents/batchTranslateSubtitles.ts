import { sendToBackground } from "@plasmohq/messaging"

import type { GeminiSingleRequestBody } from "~background/types"
import type { GeminiGetLocaleRequest } from "~background/types/GeminiGetLocaleRequest"
import type { GeminiGetLocaleResponse } from "~background/types/GeminiGetLocaleResponse"
import { BATCH_SIZE, BATCH_TRANSLATE_RETRY_INTERVAL } from "~utils/constants"
import getAllCachedTranslations from "~utils/functions/getAllCachedTranslations"
import setAllCachedTranslations from "~utils/functions/setAllCachedTranslations"
import { getData } from "~utils/localData"

export default async function batchTranslateSubtitles() {
    const [TARGET_LANGUAGE] = await Promise.all([getData("TARGET_LANGUAGE")])

    const collectedSentences = {}

    // Figure out what has already been translated.
    const NETFLIX_TO_ANKI_TRANSLATIONS = await getAllCachedTranslations()
    const alreadyTranslatedSentences =
        NETFLIX_TO_ANKI_TRANSLATIONS &&
        typeof NETFLIX_TO_ANKI_TRANSLATIONS === "object" &&
        Object.keys(NETFLIX_TO_ANKI_TRANSLATIONS).length > 1
            ? Object.keys(NETFLIX_TO_ANKI_TRANSLATIONS)
            : null

    // Remove already translated sentences from the window.untranslatedSentences
    window.untranslatedSentences = Array.from(
        new Set(window.untranslatedSentences).difference(
            new Set(alreadyTranslatedSentences)
        )
    )

    // Just get the locale
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

    // Split into BATCH_SIZE sentences from the window.untranslatedSentences
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
        const snapshotSet = new Set(window.untranslatedSentences)
        allResponses.forEach((response) => {
            if (response.translatedPhrases) {
                for (const key in response.translatedPhrases) {
                    // key should be native language, value should be target language
                    collectedSentences[key] = response.translatedPhrases[key]
                }
            } else if (response.error) {
                console.error("Error translating: ", response)
            }
        })
        window.untranslatedSentences = Array.from(
            snapshotSet.difference(new Set(Object.keys(collectedSentences)))
        )
        console.log(
            "# of sentences translated: ",
            Object.keys(collectedSentences).length,
            "# sentences remaining: ",
            window.untranslatedSentences.length
        )
        try {
            setAllCachedTranslations(collectedSentences)
        } catch (e) {
            console.error("Error setting translations: ", e)
        }
    })

    setTimeout(() => batchTranslateSubtitles(), BATCH_TRANSLATE_RETRY_INTERVAL)
}

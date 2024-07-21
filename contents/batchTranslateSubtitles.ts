import { sendToBackground } from "@plasmohq/messaging"

import type {
    GeminiSingleRequestBody,
    GeminiSingleRequestResponse
} from "~background/types"
import type { GeminiGetLocaleRequest } from "~background/types/GeminiGetLocaleRequest"
import type { GeminiGetLocaleResponse } from "~background/types/GeminiGetLocaleResponse"
import {
    BATCH_SIZE,
    BATCH_TRANSLATE_DELAY_TIME,
    BATCH_TRANSLATE_RETRY_INTERVAL,
    MAX_TRANSLATE_RETRIES,
    MIN_UNTRANSLATED_SENTENCES
} from "~utils/constants"
import delay from "~utils/functions/delay"
import getAllCachedTranslations from "~utils/functions/getAllCachedTranslations"
import initBatchTranslatedSentences from "~utils/functions/initBatchTranslatedSentences"
import setAllCachedTranslations from "~utils/functions/setAllCachedTranslations"
import { getData } from "~utils/localData"

async function getAlreadyTranslatedSentences(): Promise<string[]> {
    // Figure out what has already been translated.
    const NETFLIX_TO_ANKI_TRANSLATIONS = await getAllCachedTranslations()
    const alreadyTranslatedSentences =
        NETFLIX_TO_ANKI_TRANSLATIONS &&
        typeof NETFLIX_TO_ANKI_TRANSLATIONS === "object" &&
        Object.keys(NETFLIX_TO_ANKI_TRANSLATIONS).length > 1
            ? Object.keys(NETFLIX_TO_ANKI_TRANSLATIONS)
            : []

    // Remove already translated sentences from the window.untranslatedSentences
    window.untranslatedSentences = Array.from(
        new Set(window.untranslatedSentences).difference(
            new Set(alreadyTranslatedSentences)
        )
    )
    return alreadyTranslatedSentences
}

const batchPromise = (phrases: string[], locale: string) =>
    new Promise<{ newSentences: Record<string, string> }>((resolve, reject) => {
        sendToBackground({
            name: "gemini_translate",
            body: {
                phrases: phrases,
                sentencesLocale: locale
            } as GeminiSingleRequestBody
        }).then(async (response: GeminiSingleRequestResponse) => {
            try {
                // Initialize to include members of window.allNetflixSentences that are in NETFLIX_TO_ANKI_TRANSLATIONS
                const NETFLIX_TO_ANKI_TRANSLATIONS =
                    await getAllCachedTranslations()
                const alreadyTranslatedSentences =
                    await getAlreadyTranslatedSentences()
                const collectedSentences = {}
                for (const sentence of alreadyTranslatedSentences) {
                    if (window.allNetflixSentences.includes(sentence)) {
                        collectedSentences[sentence] =
                            NETFLIX_TO_ANKI_TRANSLATIONS[sentence]
                    }
                }
                const snapshotSet = new Set(window.untranslatedSentences)
                if (response.translatedPhrases) {
                    for (const key in response.translatedPhrases) {
                        // key should be native language, value should be target language
                        collectedSentences[key?.trim()] =
                            response.translatedPhrases[key]?.trim()
                    }
                } else if (response.error) {
                    console.error("Error translating: ", response)
                    throw new Error("Error translating: " + response.error)
                }
                window.untranslatedSentences = Array.from(
                    snapshotSet.difference(
                        new Set(Object.keys(collectedSentences))
                    )
                )
                console.log(
                    "ASYNC FORK # of sentences translated this time: ",
                    Object.keys(response.translatedPhrases).length
                )
                setAllCachedTranslations(collectedSentences).then(() => {
                    initBatchTranslatedSentences(collectedSentences)
                })
                resolve({ newSentences: collectedSentences })
            } catch (e) {
                console.error("Error setting translations: ", e)
                resolve({ newSentences: {} })
            }
        })
    })

export default async function batchTranslateSubtitles() {
    window.batchTranslateRetries++

    // don't do looping if nothing to translate or too many retries
    if (
        window.batchTranslateRetries >= MAX_TRANSLATE_RETRIES ||
        !window.untranslatedSentences ||
        window.untranslatedSentences.length <= MIN_UNTRANSLATED_SENTENCES
    ) {
        setTimeout(
            () => batchTranslateSubtitles(),
            BATCH_TRANSLATE_RETRY_INTERVAL * 2
        )
        return // stop looping
    }

    const [TARGET_LANGUAGE] = await Promise.all([getData("TARGET_LANGUAGE")])
    const USE_BATCH_SIZE = Math.ceil(
        (window.maxOfBatch < BATCH_SIZE ? window.maxOfBatch : BATCH_SIZE) /
            window.batchTranslateRetries
    ) // diminishing batch size

    const alreadyTranslatedSentences = await getAlreadyTranslatedSentences()

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

    let currentMaxSize = 0
    for (
        let i = 0;
        i < window.untranslatedSentences.length;
        i += USE_BATCH_SIZE
    ) {
        if (
            window.untranslatedSentences.slice(i, i + USE_BATCH_SIZE).length >
            currentMaxSize
        ) {
            currentMaxSize = window.untranslatedSentences.slice(
                i,
                i + USE_BATCH_SIZE
            ).length
        }
        await delay(BATCH_TRANSLATE_DELAY_TIME * window.batchTranslateRetries)
        allPromises.push(
            batchPromise(
                window.untranslatedSentences.slice(i, i + USE_BATCH_SIZE),
                sentencesLocale.locale
            )
        )
    }
    window.maxOfBatch = currentMaxSize

    await Promise.all(allPromises)
        .then((results) => {
            let newSentences = {}
            for (const result of results) {
                if (result.newSentences) {
                    newSentences = { ...newSentences, ...result.newSentences }
                }
            }
            // update cached translations
            setAllCachedTranslations(newSentences).then(() => {
                initBatchTranslatedSentences(newSentences)
            })
            console.log(
                "FINAL # of sentences translated: ",
                Object.keys(newSentences).length,
                "# sentences remaining: ",
                window.untranslatedSentences.length,
                "of total sentences ",
                window.allNetflixSentences.length
            )
        })
        .finally(() => {
            setTimeout(
                () => batchTranslateSubtitles(),
                BATCH_TRANSLATE_RETRY_INTERVAL
            )
        })
}

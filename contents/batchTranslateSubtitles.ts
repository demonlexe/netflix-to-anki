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
import {
    getCurrentShowCachedTranslations,
    setAllCachedTranslations
} from "~utils/functions/cachedTranslations"
import delay from "~utils/functions/delay"
import initBatchTranslatedSentences from "~utils/functions/initBatchTranslatedSentences"
import { getData } from "~utils/localData"

async function getAlreadyTranslatedSentences(): Promise<
    Record<string, string>
> {
    // Figure out what has already been translated.
    const NETFLIX_TO_ANKI_TRANSLATIONS =
        await getCurrentShowCachedTranslations()
    const allTranslatedKeys =
        NETFLIX_TO_ANKI_TRANSLATIONS &&
        typeof NETFLIX_TO_ANKI_TRANSLATIONS === "object" &&
        Object.keys(NETFLIX_TO_ANKI_TRANSLATIONS).length > 1
            ? Object.keys(NETFLIX_TO_ANKI_TRANSLATIONS)
            : []
    const collectedSentences = {}
    for (const sentence of allTranslatedKeys) {
        if (
            window.allNetflixSentences.includes(sentence) ||
            window.allNetflixSentences.includes(sentence?.trim())
        ) {
            collectedSentences[sentence] =
                NETFLIX_TO_ANKI_TRANSLATIONS[sentence]
        }
    }
    // Remove already translated sentences from the window.untranslatedSentences
    window.untranslatedSentences = Array.from(
        new Set(window.untranslatedSentences).difference(
            new Set(allTranslatedKeys)
        )
    )
    return collectedSentences
}

type BatchPromise = {
    newSentences: Record<string, string>
    checkQuotaExceeded?: boolean
}
const batchPromise = (phrases: string[], locale: string, showId: string) =>
    new Promise<BatchPromise>((resolve) => {
        if (showId !== window.currentShowId) return
        sendToBackground({
            name: "gemini_translate",
            body: {
                phrases: phrases,
                sentencesLocale: locale
            } as GeminiSingleRequestBody
        }).then(async (response: GeminiSingleRequestResponse) => {
            if (showId !== window.currentShowId) return
            try {
                if (response?.error) {
                    throw response.error
                }
                // Initialize to include members of window.allNetflixSentences that are in NETFLIX_TO_ANKI_TRANSLATIONS
                const collectedSentences = await getAlreadyTranslatedSentences()
                const previousCollectedSentencesCount =
                    Object.keys(collectedSentences).length

                const snapshotSet = new Set(window.untranslatedSentences)
                if (
                    response.translatedPhrases &&
                    Object.keys(response.translatedPhrases).length > 0
                ) {
                    for (const key in response.translatedPhrases) {
                        // key should be native language, value should be target language
                        collectedSentences[key?.trim()] =
                            response.translatedPhrases[key]?.trim()
                    }
                } else {
                    throw new Error(
                        "No translated phrases in response from Gemini."
                    )
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
                if (
                    Object.keys(collectedSentences).length >=
                    previousCollectedSentencesCount
                ) {
                    setAllCachedTranslations(collectedSentences).then(() => {
                        initBatchTranslatedSentences(collectedSentences)
                    })
                    resolve({ newSentences: collectedSentences })
                } else {
                    throw new Error("No new sentences translated.")
                }
            } catch (e) {
                console.error("Error setting ASYNC translations: ", e)
                resolve({
                    newSentences: {},
                    checkQuotaExceeded: response?.error?.status === 429
                })
            }
        })
    })

export default async function batchTranslateSubtitles(showId: string) {
    if (showId !== window.currentShowId) return
    window.batchTranslateRetries++

    const alreadyTranslatedSentences = await getAlreadyTranslatedSentences()

    // don't do looping if nothing to translate or too many retries
    if (
        window.batchTranslateRetries >= MAX_TRANSLATE_RETRIES ||
        !window.untranslatedSentences ||
        window.untranslatedSentences.length <= MIN_UNTRANSLATED_SENTENCES
    ) {
        setTimeout(
            () => batchTranslateSubtitles(showId),
            BATCH_TRANSLATE_RETRY_INTERVAL * 2
        )
        return // stop looping
    }

    const [TARGET_LANGUAGE] = await Promise.all([getData("TARGET_LANGUAGE")])
    const USE_BATCH_SIZE = Math.ceil(
        (BATCH_SIZE > window.untranslatedSentences.length
            ? window.untranslatedSentences.length
            : BATCH_SIZE) / window.batchTranslateRetries
    ) // diminishing batch size

    // Just get the locale
    const dummyArrayForLocale =
        window.untranslatedSentences.length > BATCH_SIZE / 2
            ? window.untranslatedSentences.slice(0, BATCH_SIZE / 2)
            : Object.keys(alreadyTranslatedSentences).slice(0, BATCH_SIZE / 2)
    const sentencesLocale: GeminiGetLocaleResponse = await sendToBackground({
        name: "gemini_get_locale",
        body: {
            targetLanguage: TARGET_LANGUAGE,
            sentences: dummyArrayForLocale
        } as GeminiGetLocaleRequest
    })
    if (!sentencesLocale?.locale || sentencesLocale?.error) {
        console.error("Error getting locale: ", sentencesLocale?.error)
        setTimeout(
            () => batchTranslateSubtitles(showId),
            BATCH_TRANSLATE_RETRY_INTERVAL * 2
        )
        return
    }

    // Split into BATCH_SIZE sentences from the window.untranslatedSentences
    const allPromises = []

    console.log(
        "Allocating batches of size ",
        USE_BATCH_SIZE,
        "and there are ",
        window.untranslatedSentences.length,
        "untranslated sentences"
    )
    for (
        let i = 0;
        i < window.untranslatedSentences.length;
        i += USE_BATCH_SIZE
    ) {
        await delay(
            BATCH_TRANSLATE_DELAY_TIME *
                ((window.batchTranslateRetries + 1) / 2)
        )
        allPromises.push(
            batchPromise(
                window.untranslatedSentences.slice(i, i + USE_BATCH_SIZE),
                sentencesLocale.locale,
                showId
            )
        )
    }

    let hadCheckQuotaExceeded = false
    await Promise.all(allPromises).then((results: BatchPromise[]) => {
        if (showId !== window.currentShowId) return
        getAlreadyTranslatedSentences()
            .then((allTranslations: Record<string, string>) => {
                if (showId !== window.currentShowId) return

                let newSentences = allTranslations

                // if one of the results had checkQuotaExceeded, set hadCheckQuotaExceeded to true
                hadCheckQuotaExceeded = results.some(
                    (res) => res.checkQuotaExceeded
                )
                for (const result of results) {
                    if (result.newSentences) {
                        newSentences = {
                            ...newSentences,
                            ...result.newSentences
                        }
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
                if (showId !== window.currentShowId) return
                setTimeout(
                    () => batchTranslateSubtitles(showId),
                    BATCH_TRANSLATE_RETRY_INTERVAL *
                        (hadCheckQuotaExceeded ? 2 : 1)
                )
            })
    })
}

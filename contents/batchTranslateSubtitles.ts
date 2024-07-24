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
import { setAllCachedTranslations } from "~utils/functions/cachedTranslations"
import delay from "~utils/functions/delay"
import getAlreadyTranslatedSentences from "~utils/functions/getAlreadyTranslatedSentences"
import getUntranslatedSentences from "~utils/functions/getUntranslatedSentences"
import updateUntranslatedSentences from "~utils/functions/updateUntranslatedSentences"

type BatchPromise = {
    newSentences: Record<string, string>
    checkQuotaExceeded?: boolean
}
const batchPromise = (
    phrases: string[],
    locale: string,
    showId: string,
    targetLanguage: string
) =>
    new Promise<BatchPromise>((resolve) => {
        sendToBackground({
            name: "gemini_translate",
            body: {
                phrases: phrases,
                sentencesLocale: locale
            } as GeminiSingleRequestBody
        }).then(async (response: GeminiSingleRequestResponse) => {
            try {
                if (response?.error || showId !== window.currentShowId) {
                    throw response.error
                }
                // Initialize to include members of window.allNetflixSentences that are in NETFLIX_TO_ANKI_TRANSLATIONS
                const collectedSentences = await getAlreadyTranslatedSentences(
                    showId,
                    targetLanguage
                )
                const previousCollectedSentencesCount =
                    Object.keys(collectedSentences).length

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
                await updateUntranslatedSentences(
                    showId,
                    targetLanguage,
                    Object.keys(collectedSentences)
                )
                console.log(
                    "ASYNC FORK # of sentences translated this time: ",
                    Object.keys(response.translatedPhrases).length
                )
                if (
                    Object.keys(collectedSentences).length >=
                    previousCollectedSentencesCount
                ) {
                    setAllCachedTranslations(collectedSentences)
                    resolve({ newSentences: collectedSentences })
                } else {
                    throw new Error("No new sentences translated.")
                }
            } catch (e) {
                resolve({
                    newSentences: {},
                    checkQuotaExceeded: response?.error?.status === 429
                })
            }
        })
    })

export default async function batchTranslateSubtitles(
    showId: string,
    targetLanguage: string,
    retries: number
) {
    if (retries === 0) {
        // this is being initialized. check if we are already translating for this combination of showId and targetLanguage.
        if (window.untranslatedSentencesCache?.[showId]?.[targetLanguage]) {
            // already translating
            console.log(
                `Already translating for this ${showId} and ${targetLanguage}`
            )
            return
        } else {
            console.log(
                "Begin translating for ",
                showId,
                targetLanguage,
                "# allNetflixSentences: ",
                window.allNetflixSentences.length
            )
            await updateUntranslatedSentences(
                showId,
                targetLanguage,
                window.allNetflixSentences
            )
        }
    }
    retries++

    const alreadyTranslatedSentences = await getAlreadyTranslatedSentences(
        showId,
        targetLanguage
    )
    console.log(
        "Already translated sentences: #",
        Object.keys(alreadyTranslatedSentences).length
    )
    const untranslatedSentences = getUntranslatedSentences(
        showId,
        targetLanguage
    )

    console.log(
        "Before translating: ",
        Object.keys(alreadyTranslatedSentences).length,
        "already translated sentences",
        "and ",
        untranslatedSentences.length,
        "untranslated sentences",
        "And retries: ",
        retries
    )
    // don't do looping if nothing to translate or too many retries
    if (
        retries >= MAX_TRANSLATE_RETRIES ||
        !untranslatedSentences ||
        untranslatedSentences.length <= MIN_UNTRANSLATED_SENTENCES
    ) {
        setTimeout(
            () => batchTranslateSubtitles(showId, targetLanguage, retries),
            BATCH_TRANSLATE_RETRY_INTERVAL * 2
        )
        return // stop looping
    }

    const USE_BATCH_SIZE = Math.ceil(
        (BATCH_SIZE > untranslatedSentences.length
            ? untranslatedSentences.length
            : BATCH_SIZE) / retries
    ) // diminishing batch size

    // Just get the locale
    const dummyArrayForLocale =
        untranslatedSentences.length > BATCH_SIZE / 2
            ? untranslatedSentences.slice(0, BATCH_SIZE / 2)
            : Object.keys(alreadyTranslatedSentences).slice(0, BATCH_SIZE / 2)
    const sentencesLocale: GeminiGetLocaleResponse = await sendToBackground({
        name: "gemini_get_locale",
        body: {
            targetLanguage: targetLanguage,
            sentences: dummyArrayForLocale
        } as GeminiGetLocaleRequest
    })
    if (!sentencesLocale?.locale || sentencesLocale?.error) {
        console.error("Error getting locale: ", sentencesLocale?.error)
        setTimeout(
            () => batchTranslateSubtitles(showId, targetLanguage, retries),
            BATCH_TRANSLATE_RETRY_INTERVAL * 2
        )
        return
    }

    // Split into BATCH_SIZE sentences from the untranslatedSentences
    const allPromises = []

    console.log(
        "Allocating batches of size ",
        USE_BATCH_SIZE,
        "and there are ",
        untranslatedSentences.length,
        "untranslated sentences"
    )
    for (let i = 0; i < untranslatedSentences.length; i += USE_BATCH_SIZE) {
        await delay(BATCH_TRANSLATE_DELAY_TIME * ((retries + 1) / 2))
        allPromises.push(
            batchPromise(
                untranslatedSentences.slice(i, i + USE_BATCH_SIZE),
                sentencesLocale.locale,
                showId,
                targetLanguage
            )
        )
    }

    let hadCheckQuotaExceeded = false
    await Promise.all(allPromises).then((results: BatchPromise[]) => {
        getAlreadyTranslatedSentences(showId, targetLanguage)
            .then((allTranslations: Record<string, string>) => {
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
                setAllCachedTranslations(newSentences)
                console.log(
                    "FINAL # of sentences translated: ",
                    Object.keys(newSentences).length,
                    "# sentences remaining: ",
                    untranslatedSentences.length,
                    "of total sentences ",
                    window.allNetflixSentences.length
                )
            })
            .finally(() => {
                if (showId !== window.currentShowId) return // stop iterating, show's sentences have changed
                setTimeout(
                    () =>
                        batchTranslateSubtitles(
                            showId,
                            targetLanguage,
                            retries
                        ),
                    BATCH_TRANSLATE_RETRY_INTERVAL *
                        (hadCheckQuotaExceeded ? 2 : 1)
                )
            })
    })
}

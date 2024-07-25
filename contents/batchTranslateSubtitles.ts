import { sendToBackground } from "@plasmohq/messaging"

import type {
    GeminiSingleRequestBody,
    GeminiSingleRequestResponse
} from "~background/types"
import type { GeminiGetLocaleRequest } from "~background/types/GeminiGetLocaleRequest"
import type { GeminiGetLocaleResponse } from "~background/types/GeminiGetLocaleResponse"
import {
    BATCH_SIZE,
    MAX_TRANSLATE_RETRIES,
    MIN_UNTRANSLATED_SENTENCES
} from "~utils/constants"
import { setAllCachedTranslations } from "~utils/functions/cachedTranslations"
import delay from "~utils/functions/delay"
import getAlreadyTranslatedSentences from "~utils/functions/getAlreadyTranslatedSentences"
import {
    getBatchWaitTime,
    getMiniBatchWaitTime
} from "~utils/functions/getBatchWaitTimes"
import getUntranslatedSentences from "~utils/functions/getUntranslatedSentences"
import logDev from "~utils/functions/logDev"
import updateUntranslatedSentences from "~utils/functions/updateUntranslatedSentences"

type BatchPromise = {
    newSentences: Record<string, string>
    checkQuotaExceeded?: boolean
}
const batchPromise = (
    phrases: string[],
    locale: string,
    showId: string,
    targetLanguage: string,
    netflixSentences: string[]
) =>
    new Promise<BatchPromise>((resolve) => {
        sendToBackground({
            name: "gemini_translate",
            body: {
                phrases: phrases,
                sentencesLocale: locale,
                targetLanguage: targetLanguage
            } as GeminiSingleRequestBody
        }).then(async (response: GeminiSingleRequestResponse) => {
            try {
                if (response?.error) {
                    throw response.error
                }
                // Initialize to include members of netflixSentences that are in NETFLIX_TO_ANKI_TRANSLATIONS
                const collectedSentences = await getAlreadyTranslatedSentences(
                    showId,
                    targetLanguage,
                    netflixSentences
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
                logDev(
                    `LANG [${targetLanguage}] SHOW [${showId}]`,
                    "ASYNC FORK # of sentences translated this time: ",
                    Object.keys(response.translatedPhrases).length
                )
                if (
                    Object.keys(collectedSentences).length >=
                    previousCollectedSentencesCount
                ) {
                    setAllCachedTranslations(
                        showId,
                        targetLanguage,
                        collectedSentences
                    )
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
    netflixSentences: string[],
    retries: number
) {
    if (retries === 0) {
        // this is being initialized. check if we are already translating for this combination of showId and targetLanguage.
        if (window.untranslatedSentencesCache?.[showId]?.[targetLanguage]) {
            // already translating
            logDev(
                `LANG [${targetLanguage}] SHOW [${showId}]`,
                `Already translating for this ${showId} and ${targetLanguage}`
            )
            return
        } else {
            logDev(
                `LANG [${targetLanguage}] SHOW [${showId}]`,
                "Begin translating for ",
                showId,
                targetLanguage,
                "# netflixSentences: ",
                netflixSentences.length
            )
            await updateUntranslatedSentences(
                showId,
                targetLanguage,
                netflixSentences
            )
        }
    }
    retries++

    const alreadyTranslatedSentences = await getAlreadyTranslatedSentences(
        showId,
        targetLanguage,
        netflixSentences
    )

    const untranslatedSentences = getUntranslatedSentences(
        showId,
        targetLanguage
    )

    logDev(
        `LANG [${targetLanguage}] SHOW [${showId}]`,
        "Before translating: #",
        Object.keys(alreadyTranslatedSentences).length,
        "already translated sentences",
        "and #",
        untranslatedSentences.length,
        "untranslated sentences",
        "On retry #",
        retries,
        "And full cache object: ",
        window.untranslatedSentencesCache
    )
    // don't do looping if nothing to translate or too many retries
    if (
        retries >= MAX_TRANSLATE_RETRIES ||
        !untranslatedSentences ||
        untranslatedSentences.length <= MIN_UNTRANSLATED_SENTENCES
    ) {
        setTimeout(
            () =>
                batchTranslateSubtitles(
                    showId,
                    targetLanguage,
                    netflixSentences,
                    retries
                ),
            getBatchWaitTime(targetLanguage, retries) * 2
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
            () =>
                batchTranslateSubtitles(
                    showId,
                    targetLanguage,
                    netflixSentences,
                    retries
                ),
            getBatchWaitTime(targetLanguage, retries) * 2
        )
        return
    }

    // Split into BATCH_SIZE sentences from the untranslatedSentences
    const allPromises = []

    logDev(
        `LANG [${targetLanguage}] SHOW [${showId}]`,
        "Allocating batches of size ",
        USE_BATCH_SIZE,
        "and there are ",
        untranslatedSentences.length,
        "untranslated sentences"
    )
    for (let i = 0; i < untranslatedSentences.length; i += USE_BATCH_SIZE) {
        await delay(
            getMiniBatchWaitTime(targetLanguage, retries) * ((retries + 1) / 2)
        )
        allPromises.push(
            batchPromise(
                untranslatedSentences.slice(i, i + USE_BATCH_SIZE),
                sentencesLocale.locale,
                showId,
                targetLanguage,
                netflixSentences
            )
        )
    }

    let hadCheckQuotaExceeded = false
    await Promise.all(allPromises).then((results: BatchPromise[]) => {
        getAlreadyTranslatedSentences(showId, targetLanguage, netflixSentences)
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
                setAllCachedTranslations(showId, targetLanguage, newSentences)
                logDev(
                    `LANG [${targetLanguage}] SHOW [${showId}]`,
                    "FINAL # of sentences translated: ",
                    Object.keys(newSentences).length,
                    "# sentences remaining: ",
                    untranslatedSentences.length,
                    "of total sentences ",
                    netflixSentences.length
                )
            })
            .finally(() => {
                setTimeout(
                    () =>
                        batchTranslateSubtitles(
                            showId,
                            targetLanguage,
                            netflixSentences,
                            retries
                        ),
                    getBatchWaitTime(targetLanguage, retries) *
                        (hadCheckQuotaExceeded ? 2 : 1)
                )
            })
    })
}

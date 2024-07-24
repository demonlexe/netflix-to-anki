import { POLLING_TRANSLATIONS_CACHE_INTERVAL } from "~utils/constants"
import { getData, type TranslationsCacheShowLanguage } from "~utils/localData"

import { setData, type TranslationsCache } from "../localData"

// update the sentences for the current show.
export async function setAllCachedTranslations(allSentences: object) {
    const cache = await getAllCachedTranslations()
    const fixedSentences = {}

    for (const [sentence, translation] of Object.entries(allSentences)) {
        fixedSentences[sentence?.trim()] = translation?.trim()
    }

    if (!cache[window.currentShowId]) {
        cache[window.currentShowId] = {}
    }

    const currentShowAndLang: TranslationsCacheShowLanguage = cache?.[
        window.currentShowId
    ]?.[window.polledSettings.TARGET_LANGUAGE] || {
        sentences: {},
        lastUpdated: Date.now()
    }
    cache[window.currentShowId][window.polledSettings.TARGET_LANGUAGE] = {
        sentences: {
            // save previous sentences and new sentences.
            ...(currentShowAndLang?.sentences ?? {}),
            ...fixedSentences
        },
        lastUpdated: Date.now()
    }

    window.translatedSentencesCache = cache
}

export async function getShowCachedTranslations(
    showId: string,
    targetLanguage: string
) {
    const cache = await getAllCachedTranslations()
    return cache?.[showId]?.[targetLanguage]?.sentences || {}
}

export async function getShowCachedReverseTranslations(
    showId: string,
    targetLanguage: string
) {
    const cache = await getAllCachedTranslations()

    const translations = cache?.[showId]?.[targetLanguage]?.sentences || {}
    // reverse the translations
    const reverseTranslations = {}
    for (const [sentence, translation] of Object.entries(translations)) {
        reverseTranslations[translation] = sentence
    }
    return reverseTranslations
}

// upload the translations to the local device.
export async function pollCachedTranslations() {
    setTimeout(async () => {
        const cache = await getAllCachedTranslations()
        await setData("NETFLIX_TO_ANKI_TRANSLATIONS_BY_ID", cache)
        pollCachedTranslations()
    }, POLLING_TRANSLATIONS_CACHE_INTERVAL)
}

// Do not use outside this file
async function getAllCachedTranslations(): Promise<TranslationsCache> {
    // all sentences is a map of sentences to other sentences.
    // split them evenly among the 5 caches.
    if (
        !window.translatedSentencesCache ||
        typeof window.translatedSentencesCache !== "object" ||
        Object.keys(window.translatedSentencesCache).length === 0
    ) {
        // initialize
        window.translatedSentencesCache = await getData(
            "NETFLIX_TO_ANKI_TRANSLATIONS_BY_ID"
        )
    }

    for (const [id, langStruct] of Object.entries(
        window.translatedSentencesCache
    )) {
        for (const [language, record] of Object.entries(langStruct)) {
            if (
                !record ||
                !id ||
                !record.sentences ||
                !record.lastUpdated ||
                Date.now() - record.lastUpdated > 1000 * 60 * 60 * 24 * 7
            ) {
                // skip if the record is empty or if the record is older than a week.
                continue
            }
            // trim all key value pairs then return
            for (const [sentence, translation] of Object.entries(
                record.sentences
            )) {
                window.translatedSentencesCache[id][language].sentences[
                    sentence?.trim()
                ] = translation?.trim()
            }
            window.translatedSentencesCache[id][language].lastUpdated =
                record.lastUpdated
        }
    }

    return window.translatedSentencesCache
}

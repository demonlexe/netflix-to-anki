import { getData, setData, type TranslationsCache } from "../localData"

// update the sentences for the current show.
export async function setAllCachedTranslations(allSentences: object) {
    const cache = await getAllCachedTranslations()
    const fixedSentences = {}

    for (const [sentence, translation] of Object.entries(allSentences)) {
        fixedSentences[sentence?.trim()] = translation?.trim()
    }

    cache[window.currentShowId] = {
        sentences: {
            // save previous sentences and new sentences.
            ...(cache?.[window.currentShowId]
                ? cache[window.currentShowId].sentences
                : {}),
            ...fixedSentences
        },
        lastUpdated: Date.now()
    }

    await Promise.all([setData("NETFLIX_TO_ANKI_TRANSLATIONS_BY_ID", cache)])
}

export async function getCurrentShowCachedTranslations() {
    const cache = await getAllCachedTranslations()
    return cache?.[window.currentShowId]?.sentences || {}
}

// Do not use outside this file
async function getAllCachedTranslations(): Promise<TranslationsCache> {
    // all sentences is a map of sentences to other sentences.
    // split them evenly among the 5 caches.
    const [cache] = await Promise.all([
        getData("NETFLIX_TO_ANKI_TRANSLATIONS_BY_ID")
    ])
    if (!cache || typeof cache !== "object") {
        return {}
    }

    const newCache: TranslationsCache = {}
    for (const [id, record] of Object.entries(cache)) {
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
        const trimmedSentences = {}
        for (const [sentence, translation] of Object.entries(
            record.sentences
        )) {
            trimmedSentences[sentence?.trim()] = translation?.trim()
        }
        newCache[id] = {
            sentences: trimmedSentences,
            lastUpdated: record.lastUpdated
        }
    }

    return newCache
}

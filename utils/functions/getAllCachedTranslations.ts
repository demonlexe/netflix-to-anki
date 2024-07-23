import { getData, type TranslationsCache } from "../localData"

export default async function getAllCachedTranslations(): Promise<TranslationsCache> {
    // all sentences is a map of sentences to other sentences.
    // split them evenly among the 5 caches.
    const [cache] = await Promise.all([
        getData("NETFLIX_TO_ANKI_TRANSLATIONS_BY_ID")
    ])

    const newCache: TranslationsCache = {}
    for (const [id, record] of Object.entries(cache)) {
        console.log(
            "How long ago was this one? ",
            record.lastUpdated - Date.now()
        )
        if (
            !record ||
            !id ||
            !record.sentences ||
            !record.lastUpdated ||
            record.lastUpdated - Date.now() > 1000 * 60 * 60 * 24 * 7
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

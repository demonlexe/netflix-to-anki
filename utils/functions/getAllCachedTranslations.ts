import { getData } from "../localData"

export default async function getAllCachedTranslations(): Promise<
    Record<string, string>
> {
    // all sentences is a map of sentences to other sentences.
    // split them evenly among the 5 caches.
    const [cache1, cache2, cache3, cache4, cache5] = await Promise.all([
        getData("NETFLIX_TO_ANKI_TRANSLATIONS_CACHE_1"),
        getData("NETFLIX_TO_ANKI_TRANSLATIONS_CACHE_2"),
        getData("NETFLIX_TO_ANKI_TRANSLATIONS_CACHE_3"),
        getData("NETFLIX_TO_ANKI_TRANSLATIONS_CACHE_4"),
        getData("NETFLIX_TO_ANKI_TRANSLATIONS_CACHE_5")
    ])

    // combine the caches and return
    const allSentences = {
        ...cache1,
        ...cache2,
        ...cache3,
        ...cache4,
        ...cache5
    }

    // trim all key value pairs then return
    const trimmedSentences = {}
    for (const [sentence, translation] of Object.entries(allSentences)) {
        trimmedSentences[sentence?.trim()] = translation?.trim()
    }
    return trimmedSentences
}

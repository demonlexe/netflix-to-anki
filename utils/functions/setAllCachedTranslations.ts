import { setData } from "../localData"

export default async function setAllCachedTranslations(allSentences: object) {
    // all sentences is a map of sentences to other sentences.
    // split them evenly among the 5 caches.
    const cache1 = {}
    const cache2 = {}
    const cache3 = {}
    const cache4 = {}
    const cache5 = {}

    const sentences = Object.entries(allSentences)
    const split = Math.ceil(sentences.length / 5)
    for (let i = 0; i < sentences.length; i++) {
        const [sentence, translation] = sentences[i]
        if (i < split) {
            cache1[sentence?.trim()] = translation?.trim()
        } else if (i < split * 2) {
            cache2[sentence?.trim()] = translation?.trim()
        } else if (i < split * 3) {
            cache3[sentence?.trim()] = translation?.trim()
        } else if (i < split * 4) {
            cache4[sentence?.trim()] = translation?.trim()
        } else {
            cache5[sentence?.trim()] = translation?.trim()
        }
    }

    await Promise.all([
        setData("NETFLIX_TO_ANKI_TRANSLATIONS_CACHE_1", cache1),
        setData("NETFLIX_TO_ANKI_TRANSLATIONS_CACHE_2", cache2),
        setData("NETFLIX_TO_ANKI_TRANSLATIONS_CACHE_3", cache3),
        setData("NETFLIX_TO_ANKI_TRANSLATIONS_CACHE_4", cache4),
        setData("NETFLIX_TO_ANKI_TRANSLATIONS_CACHE_5", cache5)
    ])
}

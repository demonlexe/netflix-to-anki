import getAllCachedTranslations from "~utils/functions/getAllCachedTranslations"

import { setData } from "../localData"

// update the sentences for the current show.
export default async function setAllCachedTranslations(allSentences: object) {
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

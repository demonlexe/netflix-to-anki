import getAlreadyTranslatedSentences from "~utils/functions/getAlreadyTranslatedSentences"
import getUntranslatedSentences from "~utils/functions/getUntranslatedSentences"

export default async function updateUntranslatedSentences(
    showId: string,
    targetLanguage: string,
    netflixSentences: string[]
) {
    const alreadyTranslatedSentences = await getAlreadyTranslatedSentences(
        showId,
        targetLanguage,
        netflixSentences
    )
    const savedUntranslatedSentences = getUntranslatedSentences(
        showId,
        targetLanguage
    )
    const snapshotSet = new Set<string>(
        savedUntranslatedSentences.length > 0
            ? savedUntranslatedSentences
            : netflixSentences
    )

    window.untranslatedSentencesCache = {
        ...window.untranslatedSentencesCache,
        [showId]: {
            [targetLanguage]: Array.from(
                snapshotSet.difference(
                    new Set(Object.keys(alreadyTranslatedSentences))
                )
            )
        }
    }
}

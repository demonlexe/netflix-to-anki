import getUntranslatedSentences from "~utils/functions/getUntranslatedSentences"

export default async function updateUntranslatedSentences(
    showId: string,
    targetLanguage: string,
    sentences: string[]
) {
    const snapshotSet = new Set<string>(
        getUntranslatedSentences(showId, targetLanguage)
    )
    window.untranslatedSentencesCache = {
        ...window.untranslatedSentencesCache,
        [showId]: {
            [targetLanguage]: Array.from(
                snapshotSet.difference(new Set(Object.keys(sentences)))
            )
        }
    }
}

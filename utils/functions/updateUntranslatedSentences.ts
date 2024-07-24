import getUntranslatedSentences from "~utils/functions/getUntranslatedSentences"

export default async function updateUntranslatedSentences(
    showId: string,
    targetLanguage: string,
    sentences: string[]
) {
    const savedUntranslatedSentences = getUntranslatedSentences(
        showId,
        targetLanguage
    )
    const snapshotSet = new Set<string>(
        savedUntranslatedSentences.length > 0
            ? savedUntranslatedSentences
            : sentences
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

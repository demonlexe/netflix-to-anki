import getAlreadyTranslatedSentences from "~utils/functions/getAlreadyTranslatedSentences"
import getUntranslatedSentences from "~utils/functions/getUntranslatedSentences"

export default async function updateUntranslatedSentences(
    showId: string,
    targetLanguage: string,
    sentences: string[]
) {
    const alreadyTranslatedSentences = await getAlreadyTranslatedSentences(
        showId,
        targetLanguage
    )
    const savedUntranslatedSentences = getUntranslatedSentences(
        showId,
        targetLanguage
    )
    const snapshotSet = new Set<string>(
        savedUntranslatedSentences.length > 0
            ? savedUntranslatedSentences
            : sentences
    )

    console.log("Sentences: #", savedUntranslatedSentences.length)
    console.log(
        "Already translated: ",
        Object.keys(alreadyTranslatedSentences).length
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

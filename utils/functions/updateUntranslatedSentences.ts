export default async function updateUntranslatedSentences(
    showId: string,
    targetLanguage: string,
    sentences: string[]
) {
    window.untranslatedSentencesCache = {
        ...window.untranslatedSentencesCache,
        [showId]: {
            [targetLanguage]: sentences
        }
    }
}

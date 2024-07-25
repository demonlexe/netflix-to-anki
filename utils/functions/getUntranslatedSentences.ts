export default function getUntranslatedSentences(
    showId: string,
    targetLanguage: string
): string[] {
    return window.untranslatedSentencesCache?.[showId]?.[targetLanguage] || []
}

export default function checkForExistingTranslation(phrase: string) {
    // pre-processing
    phrase = phrase?.trim()
    if (!phrase || phrase.length === 0) return null

    if (window.localTranslations[phrase]) {
        return window.localTranslations[phrase]
    } else if (window.batchTranslatedSentences[phrase]) {
        return window.batchTranslatedSentences[phrase]
    }
    return null
}

export default function checkForExistingReverseTranslation(phrase: string) {
    // pre-processing
    phrase = phrase?.trim()
    if (!phrase || phrase.length === 0) return null

    if (window.reverseTranslations[phrase]) {
        return window.reverseTranslations[phrase]
    } else if (window.reverseBatchTranslatedSentences[phrase]) {
        return window.reverseBatchTranslatedSentences[phrase]
    }
    return null
}

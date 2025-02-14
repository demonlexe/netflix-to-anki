function helperFn(phrase: string) {
    if (!phrase || phrase.length === 0) return null

    if (window.reverseTranslations[phrase]) {
        return window.reverseTranslations[phrase]
    }
    return null
}
export default function checkForExistingLocalReverseTranslation(
    phrase: string
) {
    // pre-processing
    const trimmedPhrase = (phrase = phrase?.trim())
    const existingReverseTranslation =
        helperFn(trimmedPhrase) ??
        helperFn(trimmedPhrase.replace(/\<br\>/gi, "<br/>")) ??
        helperFn(trimmedPhrase.replace(/\<br\/\>/gi, "<br>"))
    return existingReverseTranslation
}

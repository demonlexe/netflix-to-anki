function helperFn(phrase: string) {
    if (!phrase || phrase.length === 0) return null

    if (window.localTranslations[phrase]) {
        return window.localTranslations[phrase]
    }
    return null
}
export default function checkForExistingLocalTranslation(phrase: string) {
    // pre-processing
    const trimmedPhrase = (phrase = phrase?.trim())
    const existingTranslation =
        helperFn(trimmedPhrase) ??
        helperFn(trimmedPhrase.replace(/\<br\>/gi, "<br/>")) ??
        helperFn(trimmedPhrase.replace(/\<br\/\>/gi, "<br>"))
    return existingTranslation
}

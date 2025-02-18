function helperFn(phrase: string) {
    if (!phrase || phrase.length === 0) return false

    if (window.doNotTouchSentences[phrase]) {
        return true
    }
    return false
}
export default function checkIfSentenceIgnored(phrase: string) {
    // pre-processing
    const trimmedPhrase = phrase?.trim()
    const testAsIs = helperFn(trimmedPhrase)
    const testWithBrSlashes = helperFn(
        trimmedPhrase.replace(/<br\s*\/?>/g, "<br/>")
    )
    const testWithBrTags = helperFn(
        trimmedPhrase.replace(/<br\s*\/?>/g, "<br>")
    )
    const testWithBrTagsAndSlashes = helperFn(
        trimmedPhrase.replace(/<br\s*\/?>/g, "<br>")
    )
    const isIgnored =
        testAsIs ||
        testWithBrSlashes ||
        testWithBrTags ||
        testWithBrTagsAndSlashes
    return isIgnored
}

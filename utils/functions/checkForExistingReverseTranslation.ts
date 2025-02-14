import { getShowCachedReverseTranslations } from "~utils/functions/cachedTranslations"
import checkForExistingLocalReverseTranslation from "~utils/functions/checkForExistingLocalReverseTranslation"

function helperFn(reverseTranslations: Record<string, string>, phrase: string) {
    if (!phrase || phrase.length === 0) return null

    const existingLocalReverseTrans =
        checkForExistingLocalReverseTranslation(phrase)
    if (existingLocalReverseTrans) {
        return existingLocalReverseTrans
    } else if (reverseTranslations[phrase]) {
        return reverseTranslations[phrase]
    }
    return null
}

export default async function checkForExistingReverseTranslation(
    phrase: string
) {
    const reverseTranslations = await getShowCachedReverseTranslations(
        window.currentShowId,
        window.polledSettings.TARGET_LANGUAGE
    )
    // pre-processing
    const trimmedPhrase = phrase?.trim()
    const existingReverseTranslation =
        helperFn(reverseTranslations, trimmedPhrase) ??
        helperFn(
            reverseTranslations,
            trimmedPhrase.replace(/\<br\>/gi, "<br/>")
        ) ??
        helperFn(
            reverseTranslations,
            trimmedPhrase.replace(/\<br\/\>/gi, "<br>")
        )
    return existingReverseTranslation
}

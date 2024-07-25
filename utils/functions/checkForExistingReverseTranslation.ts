import { getShowCachedReverseTranslations } from "~utils/functions/cachedTranslations"

export default async function checkForExistingReverseTranslation(
    phrase: string
) {
    const reverseTranslations = await getShowCachedReverseTranslations(
        window.currentShowId,
        window.polledSettings.TARGET_LANGUAGE
    )
    // pre-processing
    phrase = phrase?.trim()
    if (!phrase || phrase.length === 0) return null

    if (window.reverseTranslations[phrase]) {
        return window.reverseTranslations[phrase]
    } else if (reverseTranslations[phrase]) {
        return reverseTranslations[phrase]
    }
    return null
}

import { getShowCachedTranslations } from "./cachedTranslations"

export default async function checkForExistingTranslation(phrase: string) {
    const translations = await getShowCachedTranslations(
        window.currentShowId,
        window.polledSettings.TARGET_LANGUAGE
    )
    console.log("Translations: #", Object.keys(translations).length)
    // pre-processing
    phrase = phrase?.trim()
    if (!phrase || phrase.length === 0) return null

    if (window.localTranslations[phrase]) {
        return window.localTranslations[phrase]
    } else if (translations[phrase]) {
        return translations[phrase]
    }
    return null
}

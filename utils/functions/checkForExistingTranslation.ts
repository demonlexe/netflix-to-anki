import { getCurrentShowCachedTranslations } from "./cachedTranslations"

export default function checkForExistingTranslation(phrase: string) {
    const translations = getCurrentShowCachedTranslations()
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

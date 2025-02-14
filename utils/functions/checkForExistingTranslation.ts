import checkForExistingLocalTranslation from "~utils/functions/checkForExistingLocalTranslation"

import { getShowCachedTranslations } from "./cachedTranslations"

function helperFn(translations: Record<string, string>, phrase: string) {
    if (!phrase || phrase.length === 0) return null

    const existingLocalTrans = checkForExistingLocalTranslation(phrase)
    if (existingLocalTrans) {
        return existingLocalTrans
    } else if (translations[phrase]) {
        return translations[phrase]
    }
    return null
}
export default async function checkForExistingTranslation(phrase: string) {
    const translations = await getShowCachedTranslations(
        window.currentShowId,
        window.polledSettings.TARGET_LANGUAGE
    )
    // pre-processing
    const trimmedPhrase = (phrase = phrase?.trim())
    const existingTranslation =
        helperFn(translations, trimmedPhrase) ??
        helperFn(translations, trimmedPhrase.replace(/\<br\>/gi, "<br/>")) ??
        helperFn(translations, trimmedPhrase.replace(/\<br\/\>/gi, "<br>"))
    return existingTranslation
}

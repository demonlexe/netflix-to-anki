import { getCurrentShowCachedTranslations } from "~utils/functions/cachedTranslations"

export default async function getAlreadyTranslatedSentences(
    showId: string,
    targetLanguage: string
): Promise<Record<string, string>> {
    // Figure out what has already been translated.
    if (showId !== window.currentShowId) return {}
    const NETFLIX_TO_ANKI_TRANSLATIONS =
        await getCurrentShowCachedTranslations()
    const allTranslatedKeys =
        NETFLIX_TO_ANKI_TRANSLATIONS &&
        typeof NETFLIX_TO_ANKI_TRANSLATIONS === "object" &&
        Object.keys(NETFLIX_TO_ANKI_TRANSLATIONS).length > 1
            ? Object.keys(NETFLIX_TO_ANKI_TRANSLATIONS)
            : []
    const translatedFromThisShow = {}
    for (const sentence of allTranslatedKeys) {
        if (
            window.allNetflixSentences.includes(sentence) ||
            window.allNetflixSentences.includes(sentence?.trim())
        ) {
            translatedFromThisShow[sentence] =
                NETFLIX_TO_ANKI_TRANSLATIONS[sentence]
        }
    }

    return translatedFromThisShow
}

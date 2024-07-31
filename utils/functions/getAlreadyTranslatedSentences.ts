import { getShowCachedTranslations } from "~utils/functions/cachedTranslations"

export default async function getAlreadyTranslatedSentences(
    showId: string,
    targetLanguage: string,
    videoSentences: string[]
): Promise<Record<string, string>> {
    // Figure out what has already been translated.
    const NETFLIX_TO_ANKI_TRANSLATIONS = await getShowCachedTranslations(
        showId,
        targetLanguage
    )
    const allTranslatedKeys =
        NETFLIX_TO_ANKI_TRANSLATIONS &&
        typeof NETFLIX_TO_ANKI_TRANSLATIONS === "object" &&
        Object.keys(NETFLIX_TO_ANKI_TRANSLATIONS).length > 1
            ? Object.keys(NETFLIX_TO_ANKI_TRANSLATIONS)
            : []
    const translatedFromThisShow = {}
    for (const sentence of allTranslatedKeys) {
        if (
            videoSentences.includes(sentence) ||
            videoSentences.includes(sentence?.trim())
        ) {
            translatedFromThisShow[sentence] =
                NETFLIX_TO_ANKI_TRANSLATIONS[sentence]
        }
    }

    return translatedFromThisShow
}

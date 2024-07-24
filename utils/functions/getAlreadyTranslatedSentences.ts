import { getCurrentShowCachedTranslations } from "~utils/functions/cachedTranslations"
import getUntranslatedSentences from "~utils/functions/getUntranslatedSentences"
import updateUntranslatedSentences from "~utils/functions/updateUntranslatedSentences"

export default async function getAlreadyTranslatedSentences(
    showId: string,
    targetLanguage: string
): Promise<Record<string, string>> {
    // Figure out what has already been translated.
    const NETFLIX_TO_ANKI_TRANSLATIONS =
        await getCurrentShowCachedTranslations()
    const allTranslatedKeys =
        NETFLIX_TO_ANKI_TRANSLATIONS &&
        typeof NETFLIX_TO_ANKI_TRANSLATIONS === "object" &&
        Object.keys(NETFLIX_TO_ANKI_TRANSLATIONS).length > 1
            ? Object.keys(NETFLIX_TO_ANKI_TRANSLATIONS)
            : []
    const collectedSentences = {}
    for (const sentence of allTranslatedKeys) {
        if (
            window.allNetflixSentences.includes(sentence) ||
            window.allNetflixSentences.includes(sentence?.trim())
        ) {
            collectedSentences[sentence] =
                NETFLIX_TO_ANKI_TRANSLATIONS[sentence]
        }
    }
    // Remove already translated sentences from the untranslatedSentences
    await updateUntranslatedSentences(
        showId,
        targetLanguage,
        Array.from(
            new Set<string>(
                getUntranslatedSentences(showId, targetLanguage)
            ).difference(new Set(allTranslatedKeys))
        )
    )
    return collectedSentences
}

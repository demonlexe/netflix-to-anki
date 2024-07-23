import { getCurrentShowCachedTranslations } from "~utils/functions/cachedTranslations"

export default async function initBatchTranslatedSentences(
    collectedSentences?: Record<string, string>
) {
    const translations =
        collectedSentences ?? (await getCurrentShowCachedTranslations())
    if (translations && Object.keys(translations).length > 0) {
        window.batchTranslatedSentences = translations
        for (const key in translations) {
            window.reverseBatchTranslatedSentences[translations[key]] = key
        }
    }

    console.log(
        "Loaded translations from Local Storage: #",
        translations && Object.keys(translations).length,
        translations
    )
}

import type { SupportedLocale } from "~background/types"
import type { GeminiModelResponse } from "~background/types/GeminiModelResponse"

export default async function getCurrentLanguageFromModel(
    model: any,
    phrases: string[],
    targetLanguage: string
): Promise<SupportedLocale> {
    const promptForLocale = `What language are the following phrases in? Respond with just the language code, for example, 'en-US', 'tt-RU', etc. However, if the language is the same as this: ${targetLanguage}, return the exact same language code, ${targetLanguage}.`
    const localeResult: GeminiModelResponse = await model.generateContent([
        promptForLocale,
        JSON.stringify(phrases)
    ])
    return localeResult?.response?.text()?.match(targetLanguage)?.length > 0
        ? targetLanguage
        : localeResult?.response?.text()
}

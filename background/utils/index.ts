import type { SupportedLocale } from "~background/types"

export async function getCurrentLanguageFromModel(
    model: any,
    phrases: string[]
): Promise<SupportedLocale> {
    const promptForLocale =
        "What language are the following phrases in? Respond with just the language code, for example, 'en-US', 'tt-RU', etc."
    const localeResult = await model.generateContent([
        promptForLocale,
        JSON.stringify(phrases)
    ])
    return localeResult.response.text()
}

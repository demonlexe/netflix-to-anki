import type { GeminiModelResponse } from "~background/types/GeminiModelResponse"

export default async function getCurrentLanguageFromModel(
    model: any,
    phrases: string[],
    targetLanguage: string
): Promise<string> {
    const promptForLocale = `
    Consider that "targetLanguage" is ${targetLanguage}.
    What language are the following phrases in? 
    However, if the language is the same as targetLanguage, return the exact same input, targetLanguage. 
    You can consider regional dialects to be the same, such that if the detected locale is "mexican spanish", and the targetLanguage is "spanish", you should return "spanish" as the answer.`
    const localeResult: GeminiModelResponse = await model.generateContent([
        promptForLocale,
        JSON.stringify(phrases)
    ])
    return (
        localeResult?.response?.text()?.match(targetLanguage)?.length > 0
            ? targetLanguage
            : localeResult?.response?.text()
    ).toLowerCase()
}

import { GoogleGenerativeAI } from "@google/generative-ai"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import type {
    GeminiSingleRequestBody,
    GeminiSingleRequestResponse
} from "~background/types"
import { getCurrentLanguageFromModel } from "~background/utils"
import { getData } from "~utils/localData"

const TranslationRequirements = (language: string) =>
    [
        `The main objective is to translate the following phrase to ${language}.`,
        "If there are times or numbers, please write them out.",
        "Do not include ANY formatting such as '```json'",
        "Most importantly, do not include any additional information or text in your response.",
        "EXPECTED INPUT: Multiple phrases, numbered for simplicity. For example: { '1.': 'phrase 1', '2.': 'phrase 2' }",
        "EXPECTED OUTPUT: A mapping of the phrases to their translations. For example: { `phrase 1`: `translated phrase 1`, `phrase 2`: `translated phrase 2` }",
        "Answer with only a valid JSON object in plaintext with the translated phrases mapped to the exact original phrases. ",
        "Make sure all input are translated to the target language. That is, if 50 phrases are given, all 50 should be translated separately.",
        "Do not combine any phrases. They are intentionally separated."
    ].map((line, index) => {
        return `${index + 1}. ${line}`
    })

const handler: PlasmoMessaging.MessageHandler<
    GeminiSingleRequestBody,
    GeminiSingleRequestResponse
> = async (req, res) => {
    const [API_KEY, TARGET_LANGUAGE, NATIVE_LANGUAGE] = await Promise.all([
        getData("API_KEY"),
        getData("TARGET_LANGUAGE"),
        getData("NATIVE_LANGUAGE")
    ])
    const genAI = new GoogleGenerativeAI(
        process.env.PLASMO_PUBLIC_GEMINI_TOKEN ?? API_KEY
    )
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    console.log("Request received: ", req.body)
    const { phrases } = req.body

    const sentencesLocale = await getCurrentLanguageFromModel(
        model,
        phrases,
        TARGET_LANGUAGE
    )

    const TRANSLATE_TO_LANGUAGE =
        sentencesLocale.match(TARGET_LANGUAGE)?.length > 0
            ? NATIVE_LANGUAGE
            : TARGET_LANGUAGE

    const prompt = TranslationRequirements(TRANSLATE_TO_LANGUAGE).join("\n")

    const result = await model.generateContent([
        prompt,
        JSON.stringify(phrases)
    ])
    console.log("Result: ", result.response?.text())
    const resultAsJson = JSON.parse(result.response?.text()?.trim())
    const response: GeminiSingleRequestResponse = {
        translatedPhrases: resultAsJson
    }
    console.log("Sending response...", response)
    res.send(response)
}

export default handler

import type { PlasmoMessaging } from "@plasmohq/messaging"

import type {
    GeminiSingleRequestBody,
    GeminiSingleRequestResponse
} from "~background/types"
import getCurrentLanguageFromModel from "~background/utils/functions/getCurrentLanguageFromModel"
import initModel, {
    type HandlerState
} from "~background/utils/functions/initModel"
import processGeminiResponse from "~background/utils/functions/processGeminiResponse"
import { getData } from "~utils/localData"

const handlerState: HandlerState = {
    usingApiKey: null,
    model: null
}

const TranslationRequirements = (language: string) =>
    [
        `The main objective is to translate the following phrases to ${language}.`,
        "If there are times or numbers, please write them out.",
        "Do not include ANY formatting markdown such as '```json', but please make sure the response is valid json.",
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

    try {
        await initModel(handlerState, API_KEY)

        console.log("Request received: ", req.body)
        const { phrases } = req.body

        if (!phrases || phrases.length <= 0) {
            res.send({
                error: { message: "Invalid request, no sentences to translate" }
            })
            return
        }

        const sentencesLocale =
            req.body.sentencesLocale ??
            (await getCurrentLanguageFromModel(
                handlerState.model,
                phrases,
                TARGET_LANGUAGE
            ))

        const TRANSLATE_TO_LANGUAGE =
            sentencesLocale.match(TARGET_LANGUAGE)?.length > 0
                ? NATIVE_LANGUAGE
                : TARGET_LANGUAGE

        const prompt = TranslationRequirements(TRANSLATE_TO_LANGUAGE).join("\n")

        const result = await handlerState.model.generateContent([
            prompt,
            JSON.stringify(phrases)
        ])
        const processed = processGeminiResponse(result.response?.text())
        if (!processed || Object.keys(processed).length <= 0) {
            res.send({
                error: {
                    message: "No translations found."
                }
            })
        }
        const response: GeminiSingleRequestResponse = {
            translatedPhrases: processed
        }
        res.send(response)
    } catch (e) {
        console.error("INTERNAL ERROR: ", e)
        res.send({
            error: {
                message: e?.message,
                status: e?.status
            }
        })
        return
    }
}

export default handler

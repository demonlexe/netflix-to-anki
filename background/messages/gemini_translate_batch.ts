import { GoogleGenerativeAI } from "@google/generative-ai"
import { parseString } from "xml2js"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import type {
    GeminiBatchRequestBody,
    GeminiBatchRequestResponse,
    SupportedLocale
} from "~background/types"
import { getCurrentLanguageFromModel } from "~background/utils"
import { getData, setData } from "~localData"
import { BATCH_SIZE } from "~utils/constants"

type XMLText = {
    $: any
    _?: string
    span?: XMLText
}

const getXMLTextContent = (text: XMLText) => {
    return (
        text.span && text.span[0]
            ? (text._ ?? "") + " " + getXMLTextContent(text.span[0])
            : text._ ?? ""
    ).trim()
}

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
    GeminiBatchRequestBody,
    GeminiBatchRequestResponse
> = async (req, res) => {
    const { message } = req.body
    const [API_KEY, TARGET_LANGUAGE, NATIVE_LANGUAGE] = await Promise.all([
        getData("API_KEY"),
        getData("TARGET_LANGUAGE"),
        getData("NATIVE_LANGUAGE")
    ])
    const genAI = new GoogleGenerativeAI(
        process.env.PLASMO_PUBLIC_GEMINI_TOKEN ?? API_KEY
    )

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    if (
        message.url.includes("?o") &&
        message.url.includes("nflxvideo.net") &&
        message.response?.length > 0
    ) {
        console.log("Request received: ", req.body)
        const storedTranslations = await getData("NETFLIX_TO_ANKI_TRANSLATIONS")
        const alreadyTranslatedSentences =
            storedTranslations &&
            typeof storedTranslations === "object" &&
            Object.keys(storedTranslations).length > 1
                ? Object.keys(storedTranslations)
                : null
        parseString(message.response, async function (err, result) {
            const collectedSentences = {}
            const allText: XMLText[] = result.tt.body?.[0]?.div?.[0]?.p
            const grouping = {}
            allText.forEach((text: XMLText) => {
                const textContent = getXMLTextContent(text)
                if (grouping[text.$.begin]) {
                    grouping[text.$.begin].push(textContent)
                } else {
                    grouping[text.$.begin] = [textContent]
                }
            })
            const allSentencesSet = new Set<string>()
            for (const key in grouping) {
                const sentences = grouping[key]
                sentences.forEach((sentence: string) => {
                    if (
                        !alreadyTranslatedSentences ||
                        !alreadyTranslatedSentences.includes(sentence)
                    ) {
                        allSentencesSet.add(sentence)
                    } else {
                        collectedSentences[sentence] =
                            storedTranslations[sentence]
                    }
                })
            }
            const allSentencesArray: string[] = Array.from(allSentencesSet)
            // loop through all sentences, sending to backend in groups of 50, then collect them here in a massive object.

            const dummyArrayForLocale =
                allSentencesArray.length > BATCH_SIZE / 2
                    ? allSentencesArray.slice(0, BATCH_SIZE / 2)
                    : alreadyTranslatedSentences.slice(0, BATCH_SIZE / 2)
            const sentencesLocale = await getCurrentLanguageFromModel(
                model,
                dummyArrayForLocale,
                TARGET_LANGUAGE
            )
            const TRANSLATE_TO_LANGUAGE =
                sentencesLocale.match(TARGET_LANGUAGE)?.length > 0
                    ? NATIVE_LANGUAGE
                    : TARGET_LANGUAGE

            const allPromises = []

            for (let i = 0; i < allSentencesArray.length; i += BATCH_SIZE) {
                allPromises.push(
                    geminiTranslateBatch(
                        model,
                        allSentencesArray.slice(i, i + BATCH_SIZE),
                        TRANSLATE_TO_LANGUAGE,
                        (response) => {
                            if (response.translatedPhrases) {
                                for (const key in response.translatedPhrases) {
                                    collectedSentences[key] =
                                        response.translatedPhrases[key]
                                }
                            }
                        }
                    )
                )
            }
            await Promise.all(allPromises).then(() => {
                console.log("All sentences translated: ", collectedSentences)
                setData("NETFLIX_TO_ANKI_TRANSLATIONS", collectedSentences)
                res.send({
                    translatedPhrases: collectedSentences
                })
            })
        })
        // Perform translation or other processing here
    } else {
        return res.send({ error: "Nothing" }) // return empty object if the URL is not valid
    }
}

async function geminiTranslateBatch(
    model: any,
    phrases: string[],
    locale: SupportedLocale,
    responseCallback: (response: GeminiBatchRequestResponse) => void
) {
    let response: GeminiBatchRequestResponse = null
    const prompt = TranslationRequirements(locale).join("\n")

    const phrasesNumbered = {}
    phrases.forEach((phrase, index) => {
        phrasesNumbered[index] = phrase
    })
    console.log("input to the model: ", [
        prompt,
        JSON.stringify(phrasesNumbered)
    ])
    try {
        const result = await model.generateContent([
            prompt,
            JSON.stringify(phrasesNumbered)
        ])
        console.log("No Error. Batch Result: ", result.response?.text())
        const resultAsJson: object = JSON.parse(result.response?.text()?.trim())
        response = {
            translatedPhrases: resultAsJson
        }
        console.log(
            `Sending response of length ${Object.entries(resultAsJson).length}`,
            response
        )
    } catch (e) {
        console.error("Error translating batch: ", e)
        response = { error: e.message }
    }

    console.log("Sending Response to Gemini Translate Batch: ", response)
    responseCallback(response)
}

export default handler

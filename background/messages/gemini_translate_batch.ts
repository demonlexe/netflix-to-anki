import { parseString } from "xml2js"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import type {
  GeminiBatchRequestBody,
  GeminiBatchRequestResponse,
  SupportedLocale
} from "~background/types"
import { BATCH_SIZE } from "~utils/constants"

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

async function getLocaleFromModel(
  model: any,
  phrases: string[]
): Promise<SupportedLocale> {
  const promptForLocale =
    "What language is the following phrases in? Respond with 'es' for Spanish or 'en' for English."
  const localeResult = await model.generateContent([
    promptForLocale,
    JSON.stringify(phrases)
  ])
  const regex = new RegExp("es", "gi")
  return regex.test(localeResult.response.text()) ? "es" : "en"
}

const handler: PlasmoMessaging.MessageHandler<
  GeminiBatchRequestBody,
  GeminiBatchRequestResponse
> = async (req, res) => {
  const { message } = req.body

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

  const localStorage = new Storage({
    area: "local"
  })

  if (
    message.url.includes("?o") &&
    message.url.includes("nflxvideo.net") &&
    message.response?.length > 0
  ) {
    console.log("Request received: ", req.body)
    parseString(message.response, async function (err, result) {
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
          allSentencesSet.add(sentence)
        })
      }
      const allSentencesArray: string[] = Array.from(allSentencesSet)
      // loop through all sentences, sending to backend in groups of 50, then collect them here in a massive object.
      const collectedSentences = {}
      const allPromises = []
      for (let i = 0; i < allSentencesArray.length; i += BATCH_SIZE) {
        //REVERT LATER
        allPromises.push(
          geminiTranslateBatch(
            allSentencesArray.slice(i, i + BATCH_SIZE),
            (response) => {
              if (response.translatedPhrases) {
                for (const key in response.translatedPhrases) {
                  collectedSentences[key] = response.translatedPhrases[key]
                }
              }
            }
          )
        )
      }
      await Promise.all(allPromises).then(() => {
        console.log("All sentences translated: ", collectedSentences)
        localStorage.set("netflix-to-anki-translations", collectedSentences)
        res.send({ translatedPhrases: collectedSentences, locale: "es" })
      })
    })
    // Perform translation or other processing here
  } else {
    return res.send({ error: "Nothing" }) // return empty object if the URL is not valid
  }
}

const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.PLASMO_PUBLIC_GEMINI_TOKEN)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

async function geminiTranslateBatch(
  phrases: string[],
  responseCallback: (response: GeminiBatchRequestResponse) => void
) {
  const locale = await getLocaleFromModel(model, phrases)
  let response: GeminiBatchRequestResponse = null
  const prompt =
    // flatten the requirements with numbers, like 1., 2., etc.
    locale === "es"
      ? TranslationRequirements("english").join("\n")
      : TranslationRequirements("spanish").join("\n")

  const phrasesNumbered = {}
  phrases.forEach((phrase, index) => {
    phrasesNumbered[index] = phrase
  })

  console.log("input to the model: ", [prompt, JSON.stringify(phrasesNumbered)])
  const result = await model.generateContent([
    prompt,
    JSON.stringify(phrasesNumbered)
  ])
  if (result.error || !result.response) {
    response = { error: result.error }
  } else {
    console.log("No Error. Batch Result: ", result.response?.text())
    const resultAsJson: object = JSON.parse(result.response?.text()?.trim())
    response = {
      translatedPhrases: resultAsJson,
      locale
    }
    console.log(
      `Sending response of length ${Object.entries(resultAsJson).length}`,
      response
    )
  }
  console.log("Sending Response to Gemini Translate Batch: ", response)
  responseCallback(response)
}

export default handler

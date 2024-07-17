import { GoogleGenerativeAI } from "@google/generative-ai"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import type {
  GeminiSingleRequestBody,
  GeminiSingleRequestResponse,
  SupportedLocale
} from "~background/types"

const localStorage = new Storage({
  area: "local"
})

const TranslationRequirements = (language: string) =>
  [
    `The main objective is to translate the following phrase to ${language}.`,
    "If there are times or numbers, please write them out.",
    "Answer with only a valid JSON object in plaintext with the translated phrases mapped to the exact original phrases. ",
    "Do not include ANY formatting such as '```json'",
    "Most importantly, do not include any additional information or text in your response."
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
  GeminiSingleRequestBody,
  GeminiSingleRequestResponse
> = async (req, res) => {
  const API_KEY = await localStorage.get("API_KEY")
  const genAI = new GoogleGenerativeAI(
    process.env.PLASMO_PUBLIC_GEMINI_TOKEN ?? API_KEY
  )
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  console.log("Request received: ", req.body)
  const { phrases } = req.body

  const locale = await getLocaleFromModel(model, phrases)
  const prompt =
    // flatten the requirements with numbers, like 1., 2., etc.
    locale === "es"
      ? TranslationRequirements("english").join("\n")
      : TranslationRequirements("spanish").join("\n")

  const result = await model.generateContent([prompt, JSON.stringify(phrases)])
  console.log("Result: ", result.response?.text())
  const resultAsJson = JSON.parse(result.response?.text()?.trim())
  const response: GeminiSingleRequestResponse = {
    translatedPhrases: resultAsJson,
    locale
  }
  console.log("Sending response...", response)
  res.send(response)
}

export default handler

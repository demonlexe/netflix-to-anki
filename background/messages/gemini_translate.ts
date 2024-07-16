import type { PlasmoMessaging } from "@plasmohq/messaging"

export type GeminiRequestBody = {
  phrases: string[]
}

export type SupportedLocale = "es" | "en"

export type GeminiRequestResponse = {
  translatedPhrases: Map<string, string>
  locale: SupportedLocale
}

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
  GeminiRequestBody,
  GeminiRequestResponse
> = async (req, res) => {
  console.log("Request received: ", req.body)
  const { phrases } = req.body

  const { GoogleGenerativeAI } = require("@google/generative-ai")

  const genAI = new GoogleGenerativeAI(process.env.PLASMO_PUBLIC_GEMINI_TOKEN)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  const locale = await getLocaleFromModel(model, phrases)
  const prompt =
    locale === "es"
      ? 'Please translate the following phrase to english. If there are times or numbers, please write them out. Answer with only a valid JSON object in plaintext with the translated phrases mapped to the exact original phrases. Do not include formatting such as "```json"'
      : 'Please translate the following phrase to spanish. If there are times or numbers, please write them out. Answer with only a valid JSON object in plaintext with the translated phrases mapped to the exact original phrases. Do not include formatting such as "```json"'

  const result = await model.generateContent([prompt, JSON.stringify(phrases)])
  console.log("Result: ", result.response?.text())
  const resultAsJson = JSON.parse(result.response?.text()?.trim())
  const response: GeminiRequestResponse = {
    translatedPhrases: resultAsJson,
    locale
  }
  console.log("Sending response...", response)
  res.send(response)
}

export default handler

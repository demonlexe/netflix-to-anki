import type { PlasmoMessaging } from "@plasmohq/messaging"

export type GeminiBatchRequestBody = {
  phrases: string[]
}

export type SupportedLocale = "es" | "en"

export type GeminiBatchRequestResponse = {
  translatedPhrases: object
  locale: SupportedLocale
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
  console.log("Request received: ", req.body)
  const { phrases } = req.body

  const { GoogleGenerativeAI } = require("@google/generative-ai")

  const genAI = new GoogleGenerativeAI(process.env.PLASMO_PUBLIC_GEMINI_TOKEN)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  const locale = await getLocaleFromModel(model, phrases)
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
  console.log("Result: ", result.response?.text())
  const resultAsJson: object = JSON.parse(result.response?.text()?.trim())
  const response: GeminiBatchRequestResponse = {
    translatedPhrases: resultAsJson,
    locale
  }
  console.log(
    `Sending response of length ${Object.entries(resultAsJson).length}`,
    response
  )
  res.send(response)
}

export default handler

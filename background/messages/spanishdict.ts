import { parseFromString } from "dom-parser"

import type { PlasmoMessaging } from "@plasmohq/messaging"

export type RequestBody = {
  phrase: string
}

export type RequestResponse = string

async function getLocaleFromModel(model: any, phrase: string) {
  const promptForLocale =
    "What language is the following phrase in? Respond with 'es' or 'en'."
  const localeResult = await model.generateContent([promptForLocale, phrase])
  const regex = new RegExp("es", "gi")
  return regex.test(localeResult.response.text()) ? "es" : "en"
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  RequestResponse
> = async (req, res) => {
  const { phrase } = req.body

  const { GoogleGenerativeAI } = require("@google/generative-ai")

  const genAI = new GoogleGenerativeAI(process.env.PLASMO_PUBLIC_GEMINI_TOKEN)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  const locale = await getLocaleFromModel(model, phrase)
  const prompt =
    locale === "es"
      ? "Please translate the following phrase to english. Respond with just the translated text. If there are times or numbers, please write them out. If there are multiple possible translations, please provide only one."
      : "Please translate the following phrase to spanish. Respond with just the translated text. If there are times or numbers, please write them out. If there are multiple possible translations, please provide only one."

  const result = await model.generateContent([prompt, phrase])
  console.log(result.response.text())
  res.send(result.response.text())
}

export default handler

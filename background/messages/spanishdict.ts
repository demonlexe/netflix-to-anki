import { parseFromString } from "dom-parser"

import type { PlasmoMessaging } from "@plasmohq/messaging"

export type RequestBody = {
  phrase: string
}

export type RequestResponse = string

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  RequestResponse
> = async (req, res) => {
  const { phrase } = req.body

  const { GoogleGenerativeAI } = require("@google/generative-ai")

  const genAI = new GoogleGenerativeAI(process.env.PLASMO_PUBLIC_GEMINI_TOKEN)
  console.log("TOKEN: ", process.env.PLASMO_PUBLIC_GEMINI_TOKEN)

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  const result = await model.generateContent([
    "Please translate the following phrase to english or spanish, depending on what language it is currently in. Respond with just the translated text.",
    phrase
  ])
  console.log(result.response.text())
}

export default handler

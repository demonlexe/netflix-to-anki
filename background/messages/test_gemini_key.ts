import { GoogleGenerativeAI } from "@google/generative-ai"

import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler<any, any> = async (req, res) => {
  console.log("Request received: ", req.body)
  try {
    const genAI = new GoogleGenerativeAI(
      process.env.PLASMO_PUBLIC_GEMINI_TOKEN ??
        (await localStorage.get("API_KEY"))
    )
    genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  } catch (e) {
    console.error(e)
    res.send({ error: e })
    return
  }
  res.send({ response: "Hello from Gemini!" })
}

export default handler

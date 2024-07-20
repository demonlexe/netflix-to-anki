import { GoogleGenerativeAI } from "@google/generative-ai"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import { type TestGeminiRequest } from "~background/types/TestGeminiRequest"
import type { TestGeminiResponse } from "~background/types/TestGeminiResponse"
import { getData } from "~utils/localData"

const handler: PlasmoMessaging.MessageHandler<
    TestGeminiRequest,
    TestGeminiResponse
> = async (req, res) => {
    console.log("Request received: ", req.body)

    try {
        const genAI = new GoogleGenerativeAI(req.body.key)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        await model.generateContent(["Translate this to english", "Hola"])
    } catch (e) {
        res.send({ error: e?.message })
        return
    }
    res.send({ response: "Hello from Gemini!" })
}

export default handler

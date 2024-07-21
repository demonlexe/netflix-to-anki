import { GoogleGenerativeAI } from "@google/generative-ai"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import { type TestGeminiRequest } from "~background/types/TestGeminiRequest"
import type { TestGeminiResponse } from "~background/types/TestGeminiResponse"

const handler: PlasmoMessaging.MessageHandler<
    TestGeminiRequest,
    TestGeminiResponse
> = async (req, res) => {
    console.log("test_gemini_key Request received: ", req.body)

    try {
        const genAI = new GoogleGenerativeAI(req.body.key)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        await model.generateContent(["Translate this to english\n", "Hola"])
    } catch (e) {
        console.log("test_gemini_key CAUGHT ERROR: ", e)
        res.send({ error: e?.message })
        return
    }
    res.send({ response: "Hello from Gemini!" })
}

export default handler

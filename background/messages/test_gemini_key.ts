import { GoogleGenerativeAI } from "@google/generative-ai"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import { getData } from "~localData"

const handler: PlasmoMessaging.MessageHandler<any, any> = async (req, res) => {
    console.log("Request received: ", req.body)

    try {
        const genAI = new GoogleGenerativeAI(
            process.env.PLASMO_PUBLIC_GEMINI_TOKEN ?? (await getData("API_KEY"))
        )
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        await model.generateContent(["Translate this to english", "Hola"])
    } catch (e) {
        res.send({ error: e })
        return
    }
    res.send({ response: "Hello from Gemini!" })
}

export default handler

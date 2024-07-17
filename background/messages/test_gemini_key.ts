import { GoogleGenerativeAI } from "@google/generative-ai"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const handler: PlasmoMessaging.MessageHandler<any, any> = async (req, res) => {
    console.log("Request received: ", req.body)
    const localStorage = new Storage({
        area: "local"
    })
    try {
        const genAI = new GoogleGenerativeAI(
            process.env.PLASMO_PUBLIC_GEMINI_TOKEN ??
                (await localStorage.get("API_KEY"))
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

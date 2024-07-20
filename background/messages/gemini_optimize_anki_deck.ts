import { GoogleGenerativeAI } from "@google/generative-ai"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import type { GeminiOptimizeAnkiDeckRequest } from "~background/types/GeminiOptimizeAnkiDeckRequest"
import type { GeminiOptimizeAnkiDeckResponse } from "~background/types/GeminiOptimizeAnkiDeckResponse"
import { getData } from "~utils/localData"

const geminiPrompt = (deck: Record<string, string>) =>
    [
        "Please optimize the following anki deck, and return the optimized deck. It should be in the same JSON format.",
        "Please remove any duplicate phrases, including those that are translated reversely to the same phrase.",
        JSON.stringify(deck)
    ].join("\n")

const handler: PlasmoMessaging.MessageHandler<
    GeminiOptimizeAnkiDeckRequest,
    GeminiOptimizeAnkiDeckResponse
> = async (req, res) => {
    try {
        console.log("Deck before optimization: ", req.body.deck)
        const genAI = new GoogleGenerativeAI(await getData("API_KEY"))
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const newDeck = await model.generateContent([
            geminiPrompt(req.body.deck)
        ])
        console.log("Gemini Optimization Result: ", newDeck.response?.text())
        res.send({ deck: JSON.parse(newDeck.response?.text()) })
    } catch (e) {
        res.send({ error: e?.message })
        return
    }
}

export default handler

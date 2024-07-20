import { GoogleGenerativeAI } from "@google/generative-ai"

import type { PlasmoMessaging } from "@plasmohq/messaging"

import type { GeminiOptimizeAnkiDeckRequest } from "~background/types/GeminiOptimizeAnkiDeckRequest"
import type { GeminiOptimizeAnkiDeckResponse } from "~background/types/GeminiOptimizeAnkiDeckResponse"
import { getData } from "~utils/localData"

const geminiPrompt = (deck: Record<string, string>) =>
    [
        "Please optimize the following language learning Anki deck and return the optimized deck in the same JSON format. To optimize the deck, please use your own discretion, but also:",
        "\n",
        "1. Remove any duplicate phrases.",
        "2. Do not include ANY formatting markdown such as '```json'",
        "3. Maintain the standard of mapping the target language to the native language.",
        "\n",
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
        console.log(
            "Gemini Optimization Result: ",
            JSON.parse(newDeck.response?.text())
        )
        res.send({ deck: JSON.parse(newDeck.response?.text()) })
    } catch (e) {
        console.log("ERROR: ", e)
        res.send({ error: e?.message })
        return
    }
}

export default handler

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
        console.log(
            "Deck before optimization: ",
            req.body.deck,
            "Total phrases: ",
            Object.keys(req.body.deck).length
        )
        const genAI = new GoogleGenerativeAI(await getData("API_KEY"))
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const newDeck = await model.generateContent([
            geminiPrompt(req.body.deck)
        ])
        const optimizedDeck: Record<string, string> = JSON.parse(
            newDeck.response?.text()
        )
        if (!optimizedDeck) {
            throw new Error("Optimized deck is empty.")
        }
        const optimizedDeckWithDuplicatedRemoved = {}
        // iterate optimized deck and manually remove duplicates
        for (const [key, value] of Object.entries(optimizedDeck)) {
            const trimmedKey = key?.trim()
            const trimmedValue = value?.trim()
            if (trimmedKey !== trimmedValue) {
                optimizedDeckWithDuplicatedRemoved[trimmedKey] = trimmedValue
            }
        }
        console.log(
            "Deck after optimization: ",
            optimizedDeckWithDuplicatedRemoved,
            "Total phrases: ",
            Object.keys(optimizedDeckWithDuplicatedRemoved).length
        )

        const allPhrasesOriginal = new Set(Object.values(req.body.deck)).union(
            new Set(Object.keys(req.body.deck))
        )
        const allPhrasesOptimized = new Set(
            Object.values(optimizedDeckWithDuplicatedRemoved)
        ).union(new Set(Object.keys(optimizedDeckWithDuplicatedRemoved)))
        const missingPhrasesSet =
            allPhrasesOriginal.difference(allPhrasesOptimized)
        console.log(
            "Missing phrases set:",
            missingPhrasesSet,
            "Missing phrases set count:",
            missingPhrasesSet.size
        )

        res.send({ deck: optimizedDeckWithDuplicatedRemoved })
    } catch (e) {
        console.log("ERROR: ", e)
        res.send({ error: e?.message })
        return
    }
}

export default handler
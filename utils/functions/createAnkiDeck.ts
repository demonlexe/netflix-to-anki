import { sendToBackground } from "@plasmohq/messaging"

import type { GeminiOptimizeAnkiDeckResponse } from "~background/types/GeminiOptimizeAnkiDeckResponse"
import { getData } from "~utils/localData"

export default async function createAnkiDeck(): Promise<File> {
    const [NEED_TO_STUDY] = await Promise.all([getData("NEED_TO_STUDY")])
    // optimize with Gemini
    const optimizedDeckResponse: GeminiOptimizeAnkiDeckResponse =
        await sendToBackground({
            name: "gemini_optimize_anki_deck",
            body: { deck: NEED_TO_STUDY }
        })
    if (!optimizedDeckResponse || optimizedDeckResponse.error) {
        return null
    }
    const optimizedDeck = optimizedDeckResponse.deck
    // Then build the file
    const allCards = []
    for (const [key, value] of Object.entries(optimizedDeck ?? {})) {
        const newKey = key?.replace(/\n/g, " ")?.replace(/\t/g, " ")?.trim()
        const newValue = value?.replace(/\n/g, " ")?.replace(/\t/g, " ")?.trim()
        if (!newKey || !newValue) continue

        allCards.push(`${newKey}\t${newValue}`)
    }
    const file = new File(
        [allCards.join("\n")],
        `NetflixToAnki_${new Date().toISOString()}.txt`,
        {
            type: "text/plain"
        }
    )

    return file
}

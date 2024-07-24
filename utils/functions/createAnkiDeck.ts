import { sendToBackground } from "@plasmohq/messaging"

import type { GeminiOptimizeAnkiDeckResponse } from "~background/types/GeminiOptimizeAnkiDeckResponse"
import { getData } from "~utils/localData"

import optimizeAnkiDeck from "./optimizeAnkiDeck"

export default async function createAnkiDeck(
    useOptimized: boolean
): Promise<File> {
    const [NEED_TO_STUDY] = await Promise.all([getData("NEED_TO_STUDY")])
    let deckToUse = NEED_TO_STUDY ?? {}
    if (useOptimized) {
        // optimize with Gemini
        const optimizedDeckResponse: GeminiOptimizeAnkiDeckResponse =
            await sendToBackground({
                name: "gemini_optimize_anki_deck",
                body: { deck: NEED_TO_STUDY }
            })
        if (!optimizedDeckResponse || optimizedDeckResponse.error) {
            return null
        }
        deckToUse = optimizedDeckResponse.deck
    } else {
        deckToUse = optimizeAnkiDeck(deckToUse)
    }

    // Then build the file
    const allCards = []
    for (const [key, value] of Object.entries(deckToUse)) {
        const newKey = key
            ?.replace(/\n/g, " ")
            ?.replace(/\t/g, " ")
            ?.replace(/(<br\s*\/>)/g, " ")
            ?.trim()
        const newValue = value
            ?.replace(/\n/g, " ")
            ?.replace(/\t/g, " ")
            ?.replace(/(<br\s*\/>)/g, " ")
            ?.trim()
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

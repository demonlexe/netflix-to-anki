export default function optimizeAnkiDeck(
    deck: Record<string, string>
): Record<string, string> {
    const optimizedDeckWithDuplicatedRemoved = {}
    // iterate optimized deck and manually remove duplicates
    for (const [key, value] of Object.entries(deck)) {
        const trimmedKey = key?.trim()
        const trimmedValue = value?.trim()
        if (trimmedKey !== trimmedValue) {
            optimizedDeckWithDuplicatedRemoved[trimmedKey] = trimmedValue
        }
    }

    return optimizedDeckWithDuplicatedRemoved
}

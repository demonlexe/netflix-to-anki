import { getData } from "~utils/localData"

export default async function createAnkiDeck(): Promise<File> {
    const [NEED_TO_STUDY] = await Promise.all([getData("NEED_TO_STUDY")])
    const allCards = []
    for (const [key, value] of Object.entries(NEED_TO_STUDY ?? {})) {
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

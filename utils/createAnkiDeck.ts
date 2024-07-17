import { getData, setData } from "~localData"

export default async function createAnkiDeck(): Promise<File> {
    const [NEED_TO_STUDY, ANKI_CONFIG] = await Promise.all([
        getData("NEED_TO_STUDY"),
        getData("ANKI_CONFIG")
    ])
    const allCards = []
    for (const [key, value] of Object.entries(NEED_TO_STUDY ?? {})) {
        switch (ANKI_CONFIG) {
            case "BOTH":
                allCards.push(`${key}\t${value}`)
                allCards.push(`${value}\t${key}`)
                break
            case "PROMPT_NATIVE":
                allCards.push(`${key}\t${value}`)
                break
            case "PROMPT_TARGET":
                allCards.push(`${value}\t${key}`)
                break
        }
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

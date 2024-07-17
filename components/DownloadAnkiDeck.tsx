import { getData } from "~localData"
import { download } from "~utils/index"

export default function DownloadAnkiDeck() {
    return (
        <button
            onClick={async () => {
                const NEED_TO_STUDY = await getData("NEED_TO_STUDY")
                const allCards = []
                for (const [key, value] of Object.entries(NEED_TO_STUDY)) {
                    allCards.push(`${key}\t${value}`)
                }
                const file = new File(
                    [allCards.join("\n")],
                    `NetflixToAnki_${new Date().toISOString()}.txt`,
                    {
                        type: "text/plain"
                    }
                )
                download(file)
            }}>
            Click me to download Anki deck.
        </button>
    )
}

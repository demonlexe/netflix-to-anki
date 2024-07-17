import createAnkiDeck from "~utils/createAnkiDeck"
import { download } from "~utils/index"

export default function DownloadAnkiDeck() {
    return (
        <button
            onClick={async () => {
                const file = await createAnkiDeck()
                download(file)
            }}>
            Click me to download Anki deck.
        </button>
    )
}

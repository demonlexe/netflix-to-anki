import createAnkiDeck from "~utils/functions/createAnkiDeck"
import { download } from "~utils/index"

type DownloadAnkiDeckProps = {
    numberToStudy: number
}

export default function DownloadAnkiDeck(props: DownloadAnkiDeckProps) {
    const { numberToStudy } = props
    return (
        <button
            disabled={!numberToStudy}
            onClick={async () => {
                const file = await createAnkiDeck()
                if (!file) return //FIXME - Show an error here.
                download(file)
            }}>
            {`Click me to download Anki deck.${numberToStudy ? ` [${numberToStudy}]` : ""}`}
        </button>
    )
}

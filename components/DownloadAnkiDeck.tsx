import createAnkiDeck from "~utils/functions/createAnkiDeck"
import { download } from "~utils/index"

type DownloadAnkiDeckProps = {
    numberToStudy: number
    useOptimized: boolean
}

export default function DownloadAnkiDeck(props: DownloadAnkiDeckProps) {
    const { numberToStudy, useOptimized } = props
    return (
        <button
            disabled={!numberToStudy}
            onClick={async () => {
                const file = await createAnkiDeck(useOptimized)
                if (!file) return //FIXME - Show an error here.
                download(file)
            }}>
            {useOptimized
                ? `[ALPHA] Download Gemini-Optimized Anki deck.`
                : `Download Anki deck.${numberToStudy ? ` [${numberToStudy}]` : ""}`}
        </button>
    )
}

import { Button } from "~node_modules/react-bootstrap/esm"
import createAnkiDeck from "~utils/functions/createAnkiDeck"
import { download } from "~utils/index"

type DownloadAnkiDeckProps = {
    numberToStudy: number
    useOptimized: boolean
}

export default function DownloadAnkiDeck(props: DownloadAnkiDeckProps) {
    const { numberToStudy, useOptimized } = props
    return (
        <Button
            disabled={!numberToStudy}
            onClick={async () => {
                const file = await createAnkiDeck(useOptimized)
                if (!file) return //FIXME - Show an error here.
                download(file)
            }}
            style={{ fontSize: ".8em" }}>
            {useOptimized
                ? `Download Gemini-Optimized Anki deck. [ALPHA]`
                : `Download Anki deck.${numberToStudy ? ` [${numberToStudy}]` : ""}`}
        </Button>
    )
}

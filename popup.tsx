import { useEffect, useState } from "react"

import BooleanSettings from "~components/BooleanSettings"
import DownloadAnkiDeck from "~components/DownloadAnkiDeck"
import ResetAnkiDeck from "~components/ResetAnkiDeck"
import Settings from "~components/Settings"
import getNeedToStudyLength from "~utils/functions/getNeedToStudyLength"

function IndexPopup() {
    const [numberToStudy, setNumberToStudy] = useState<number>()
    const updateNumberToStudy = () => {
        getNeedToStudyLength().then((length) => {
            setNumberToStudy(length)
        })
    }
    useEffect(() => {
        updateNumberToStudy()
    }, [])

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                padding: "16px",
                gap: "4px",
                width: "300px"
            }}>
            <h2>netflix-to-anki</h2>
            <Settings />
            <DownloadAnkiDeck
                numberToStudy={numberToStudy}
                useOptimized={false}
            />
            <DownloadAnkiDeck
                numberToStudy={numberToStudy}
                useOptimized={true}
            />
            <ResetAnkiDeck onReset={updateNumberToStudy} />
            <BooleanSettings />
        </div>
    )
}

export default IndexPopup

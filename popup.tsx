import { useEffect, useState } from "react"

import DownloadAnkiDeck from "~components/DownloadAnkiDeck"
import ResetAnkiDeck from "~components/ResetAnkiDeck"
import Settings from "~components/Settings"
import getNeedToStudyLength from "~utils/getNeedToStudyLength"

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
                padding: 16
            }}>
            <h2>netflix-to-anki</h2>
            <Settings />
            <DownloadAnkiDeck numberToStudy={numberToStudy} />
            <ResetAnkiDeck onReset={updateNumberToStudy} />
        </div>
    )
}

export default IndexPopup

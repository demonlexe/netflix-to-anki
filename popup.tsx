import { useEffect, useState } from "react"

import DisplayTranslationStatus from "~components/DisplayTranslationStatus"
import DownloadAnkiDeck from "~components/DownloadAnkiDeck"
import ResetAnkiDeck from "~components/ResetAnkiDeck"
import styles from "~styles/popup.module.css"
import getCurrentYear from "~utils/functions/getCurrentYear"
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
    const manifestData = chrome.runtime.getManifest()
    return (
        <div className={styles.container}>
            <div className={`${styles.flexRow} ${styles.spaceBetween}`}>
                <button
                    className={styles.settingsButton}
                    onClick={() => {
                        chrome.tabs.create({
                            url: `chrome-extension://${chrome.runtime.id}/tabs/onboarding.html`
                        })
                    }}>
                    <span>⚙</span>
                </button>
            </div>
            <div className={styles.flexRow}>
                <DownloadAnkiDeck
                    numberToStudy={numberToStudy}
                    useOptimized={false}
                />
                <DownloadAnkiDeck
                    numberToStudy={numberToStudy}
                    useOptimized={true}
                />
                <ResetAnkiDeck
                    onReset={updateNumberToStudy}
                    disabled={!numberToStudy}
                />
            </div>
            <DisplayTranslationStatus />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>{`NetflixToAnki ${getCurrentYear()}`}</div>
                <div>v{manifestData.version}</div>
            </div>
        </div>
    )
}

export default IndexPopup

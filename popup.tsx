import { useEffect, useState } from "react"

import DisplayTranslationStatus from "~components/DisplayTranslationStatus"
import DownloadAnkiDeck from "~components/DownloadAnkiDeck"
import ResetAnkiDeck from "~components/ResetAnkiDeck"
import styles from "~styles/popup.module.css"

import "~styles/globals.scss"

import { Button } from "~node_modules/react-bootstrap/esm"
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
            <div className={`d-flex gap-2 flex-column`}>
                <DownloadAnkiDeck
                    numberToStudy={numberToStudy}
                    useOptimized={false}
                />
                <DownloadAnkiDeck
                    numberToStudy={numberToStudy}
                    useOptimized={true}
                />
            </div>
            <DisplayTranslationStatus />
            <div className={`${styles.flexRow} ${styles.spaceBetween}`}>
                <Button
                    variant="outline-secondary"
                    className={styles.settingsButton}
                    style={{ flex: 1, height: "100%", padding: "0" }}
                    onClick={() => {
                        chrome.tabs.create({
                            url: `chrome-extension://${chrome.runtime.id}/tabs/onboarding.html`
                        })
                    }}>
                    <span style={{ fontSize: ".7em" }}>⚙</span>
                </Button>

                <ResetAnkiDeck
                    onReset={updateNumberToStudy}
                    disabled={!numberToStudy}
                    style={{ flex: 3 }}
                />
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "1em"
                }}>
                <div>{`NetflixToAnki ${getCurrentYear()}`}</div>
                <div>v{manifestData.version}</div>
            </div>
        </div>
    )
}

export default IndexPopup

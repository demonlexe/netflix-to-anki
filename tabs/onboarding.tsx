import { useEffect, useState } from "react"

import BooleanSettings from "~components/BooleanSettings"
import DownloadAnkiDeck from "~components/DownloadAnkiDeck"
import Header from "~components/Header"
import ResetAnkiDeck from "~components/ResetAnkiDeck"
import Settings from "~components/Settings"
import styles from "~styles/onboarding.module.css"
import getNeedToStudyLength from "~utils/functions/getNeedToStudyLength"

function Onboarding() {
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
        <div className={styles.container}>
            <div className={styles.content}>
                <Header />
                <Settings />
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
                <BooleanSettings />
            </div>
        </div>
    )
}

export default Onboarding

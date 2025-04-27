import { useEffect, useState } from "react"

import styles from "~styles/display-translation-status.module.css"
import { POLLING_STATUS_INTERVAL } from "~utils/constants"
import { getData } from "~utils/localData"

export default function DisplayTranslationStatus() {
    const [allSentencesCt, setAllSentencesCt] = useState<number>()
    const [translatedCt, setTranslatedCt] = useState<number>()

    const getTranslationStatus = async () => {
        const status = await getData("TRANSLATION_STATUS")
        setTranslatedCt(status?.TRANSLATED_CURRENT)
        setAllSentencesCt(status?.TOTAL_SENTENCES)
        setTimeout(() => {
            getTranslationStatus()
        }, POLLING_STATUS_INTERVAL)
    }

    useEffect(() => {
        getTranslationStatus()
    }, [])

    const openSentenceBrowser = () => {
        chrome.tabs.create({
            url: `chrome-extension://${chrome.runtime.id}/tabs/sentence-browser.html`
        })
    }

    return (
        <div className={styles.container}>
            <p style={{ flex: 2, marginBottom: 0 }}>Translation Status:</p>
            {allSentencesCt ? (
                <a
                    onClick={(e) => {
                        e.preventDefault()
                        openSentenceBrowser()
                    }}
                    href="#"
                    style={{
                        color: "green",
                        flex: 1,
                        marginBottom: "0"
                    }}>{`${translatedCt}/${allSentencesCt}`}</a>
            ) : (
                <p style={{ flex: 1, marginBottom: 0 }}>N/A</p>
            )}
        </div>
    )
}

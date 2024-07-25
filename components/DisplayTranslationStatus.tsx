import { useEffect, useState } from "react"

import styles from "~styles/display-translation-status.module.css"
import { getData } from "~utils/localData"

export default function DisplayTranslationStatus() {
    const [allSentencesCt, setAllSentencesCt] = useState<number>()
    const [translatedCt, setTranslatedCt] = useState<number>()

    useEffect(() => {
        Promise.all([
            getData("TRANSLATED_CURRENT"),
            getData("TOTAL_SENTENCES")
        ]).then(([transCt, allCt]) => {
            setTranslatedCt(transCt)
            setAllSentencesCt(allCt)
        })
    }, [])
    return (
        <div className={styles.container}>
            <h4>Completed Translations</h4>
            {allSentencesCt ? (
                <p>{`${translatedCt}/${allSentencesCt}`}</p>
            ) : (
                <p>Translation is in progress...</p>
            )}
        </div>
    )
}

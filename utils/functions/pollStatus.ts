import { POLLING_TRANSLATIONS_CACHE_INTERVAL } from "~utils/constants"
import getAlreadyTranslatedSentences from "~utils/functions/getAlreadyTranslatedSentences"
import { setData } from "~utils/localData"

import logDev from "./logDev"

export default function pollStatus() {
    setTimeout(async () => {
        logDev("Polling status...")
        const alreadyTranslatedSentences = await getAlreadyTranslatedSentences(
            window.currentShowId,
            window.polledSettings.TARGET_LANGUAGE,
            window.cachedNetflixSentences
        )
        setData(
            "TRANSLATED_CURRENT",
            Object.keys(alreadyTranslatedSentences).length
        )
        setData("TOTAL_SENTENCES", window.cachedNetflixSentences.length)
        pollStatus()
    }, POLLING_TRANSLATIONS_CACHE_INTERVAL)
}

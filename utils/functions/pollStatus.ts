import { POLLING_TRANSLATIONS_CACHE_INTERVAL } from "~utils/constants"
import { setData } from "~utils/localData"

import { getShowCachedTranslations } from "./cachedTranslations"
import logDev from "./logDev"

export default function pollStatus() {
    setTimeout(async () => {
        logDev("Polling status...")
        setData(
            "TRANSLATED_CURRENT",
            Object.keys(
                await getShowCachedTranslations(
                    window.currentShowId,
                    window.polledSettings.TARGET_LANGUAGE
                )
            ).length
        )
        setData("TOTAL_SENTENCES", window.cachedNetflixSentences.length)
        pollStatus()
    }, POLLING_TRANSLATIONS_CACHE_INTERVAL)
}

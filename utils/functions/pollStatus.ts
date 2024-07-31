import { POLLING_STATUS_INTERVAL } from "~utils/constants"
import getAlreadyTranslatedSentences from "~utils/functions/getAlreadyTranslatedSentences"
import { setData } from "~utils/localData"

export default function pollStatus() {
    setTimeout(async () => {
        const alreadyTranslatedSentences = await getAlreadyTranslatedSentences(
            window.currentShowId,
            window.polledSettings.TARGET_LANGUAGE,
            window.cachedVideoSentences
        )
        await setData("TRANSLATION_STATUS", {
            TRANSLATED_CURRENT: Object.keys(alreadyTranslatedSentences).length,
            TOTAL_SENTENCES: window.cachedVideoSentences.length
        })
        pollStatus()
    }, POLLING_STATUS_INTERVAL)
}

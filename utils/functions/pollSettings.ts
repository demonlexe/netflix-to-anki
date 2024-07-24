import batchTranslateSubtitles from "~contents/batchTranslateSubtitles"
import { USER_SETTINGS_DEFAULTS } from "~utils/constants"
import extractIdFromUrl from "~utils/functions/extractMovieFromNetflixUrl"
import { getData, type UserSettings } from "~utils/localData"

import getUntranslatedSentences from "./getUntranslatedSentences"
import updateUntranslatedSentences from "./updateUntranslatedSentences"

// refetch settings every 8 seconds
export default async function pollSettings() {
    const targetLanguage = await getData("TARGET_LANGUAGE")
    Object.keys(USER_SETTINGS_DEFAULTS).forEach(async (key) => {
        const showId = extractIdFromUrl(window.location.href)
        const newValue = await getData(key as keyof UserSettings)
        const currentUntranslatedSentences = getUntranslatedSentences(
            showId,
            targetLanguage
        )
        if (
            newValue !== undefined &&
            window.polledSettings[key] !== newValue &&
            key === "TARGET_LANGUAGE" &&
            window.allNetflixSentences.length > 0 &&
            currentUntranslatedSentences.length <= 0
        ) {
            console.log(
                "TARGET_LANGUAGE Settings changed: ",
                window.polledSettings[key],
                " became ",
                newValue
            )
            await updateUntranslatedSentences(
                showId,
                "" + newValue,
                window.allNetflixSentences
            )
            batchTranslateSubtitles(showId, "" + newValue, 0)
        }
        window.polledSettings[key] = newValue
    })
    setTimeout(pollSettings, 8000)
}

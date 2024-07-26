import batchTranslateSubtitles from "~contents/batchTranslateSubtitles"
import {
    POLLING_TRANSLATIONS_CACHE_INTERVAL,
    USER_SETTINGS_DEFAULTS
} from "~utils/constants"
import extractIdFromUrl from "~utils/functions/extractMovieFromNetflixUrl"
import { getData, type UserSettings } from "~utils/localData"

import getUntranslatedSentences from "./getUntranslatedSentences"
import logDev from "./logDev"

// refetch settings every 8 seconds
export default async function pollSettings() {
    const targetLanguage = await getData("TARGET_LANGUAGE")
    Object.keys(USER_SETTINGS_DEFAULTS).forEach(async (key) => {
        const showId = extractIdFromUrl(window.location.href)
        const newValue = await getData(key as keyof UserSettings)
        const currentUntranslatedSentences = targetLanguage
            ? getUntranslatedSentences(showId, targetLanguage)
            : []
        if (
            newValue !== undefined &&
            window.polledSettings[key] !== newValue &&
            key === "TARGET_LANGUAGE" &&
            currentUntranslatedSentences.length <= 0
        ) {
            logDev(
                "TARGET_LANGUAGE Settings changed: ",
                window.polledSettings[key],
                " became ",
                newValue,
                " and window.cachedNetflixSentences.length is ",
                window.cachedNetflixSentences.length,
                " and window.cachedNextEpisodeNetflixSentences.length is ",
                window.cachedNextEpisodeNetflixSentences.length
            )
            if (window.cachedNetflixSentences.length > 0) {
                batchTranslateSubtitles(
                    showId,
                    "" + newValue,
                    window.cachedNetflixSentences,
                    0
                )
            }
            if (window.cachedNextEpisodeNetflixSentences.length > 0) {
                batchTranslateSubtitles(
                    "" + (Number(showId.trim()) + 1),
                    "" + newValue,
                    window.cachedNextEpisodeNetflixSentences,
                    0
                )
            }
        }
        window.polledSettings[key] = newValue
    })
    setTimeout(pollSettings, POLLING_TRANSLATIONS_CACHE_INTERVAL)
}

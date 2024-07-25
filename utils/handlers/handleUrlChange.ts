import extractIdFromUrl from "~utils/functions/extractMovieFromNetflixUrl"
import logDev from "~utils/functions/logDev"

export default function handleUrlChange() {
    const newShowId = extractIdFromUrl(window.location.href)
    if (newShowId !== window.currentShowId) {
        logDev("URL CHANGED! newShowId:", newShowId)
        if (
            Number(window.currentShowId?.trim() ?? 0) - 1 ===
            Number(newShowId?.trim() ?? 0)
        ) {
            // we went back to the previous episode
            window.cachedNextEpisodeNetflixSentences = []
            window.cachedNetflixSentences = []
            logDev("RETREATED TO PREVIOUS EPISODE")
        } else {
            window.cachedNetflixSentences =
                window.cachedNextEpisodeNetflixSentences ?? []
            window.cachedNextEpisodeNetflixSentences = []
            logDev("MOVED TO NEXT EPISODE OR OTHER SHOW")
        }
    }
    window.currentShowId = newShowId
}

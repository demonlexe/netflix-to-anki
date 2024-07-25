import extractIdFromUrl from "~utils/functions/extractMovieFromNetflixUrl"

export default function handleUrlChange() {
    const newShowId = extractIdFromUrl(window.location.href)
    if (newShowId !== window.currentShowId) {
        console.log("URL CHANGED! newShowId:", newShowId)
        window.cachedNetflixSentences =
            window.cachedNextEpisodeNetflixSentences ?? []
        window.cachedNextEpisodeNetflixSentences = []
    }
    window.currentShowId = newShowId
}

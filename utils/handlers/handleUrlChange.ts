import extractIdFromUrl from "~utils/functions/extractMovieFromNetflixUrl"
import resetNetflixContext from "~utils/functions/resetNetflixContext"

export default function handleUrlChange() {
    const newShowId = extractIdFromUrl(window.location.href)
    if (newShowId !== window.currentShowId) {
        console.log("URL CHANGED! newShowId:", newShowId)
        resetNetflixContext()
    }
    window.currentShowId = newShowId
}

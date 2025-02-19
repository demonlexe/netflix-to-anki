import logDev from "./logDev"

export default function extractIdFromUrl(url: string) {
    // Define regex patterns for different streaming services
    const patterns: Record<string, RegExp> = {
        netflix: /\/watch\/([a-zA-Z0-9-]+)\?/,
        hulu: /\/watch\/([a-zA-Z0-9-]+)/,
        max: /\/video\/watch\/([a-zA-Z0-9-]+)\//,
        tubiTvShows: /\/tv-shows\/([^?]+)/,
        tubiMovies: /\/movies\/([^?]+)/
    }

    // Determine which pattern to use based on the site
    let match
    if (window.usingSite === "netflix" || window.usingSite === "hulu") {
        match = url.match(patterns[window.usingSite])
    } else if (window.usingSite === "hbomax") {
        match = url.match(patterns.max)
    } else if (window.usingSite === "tubi") {
        match =
            url.match(patterns.tubiTvShows) || url.match(patterns.tubiMovies)
    }

    if (match && match[1]) {
        if (match[1] !== window.currentShowId) {
            logDev("I have set the current show id to", match[1])
        }
        return match[1]
    }

    return null // Return null if no match is found
}

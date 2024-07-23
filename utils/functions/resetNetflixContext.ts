export default function resetNetflixContext() {
    window.untranslatedSentencesCache = {}
    window.allNetflixSentences = []
    window.batchTranslateRetries = 0
}

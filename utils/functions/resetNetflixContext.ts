import { BATCH_SIZE } from "~utils/constants"

export default function resetNetflixContext() {
    window.untranslatedSentences = []
    window.allNetflixSentences = []
    window.batchTranslateRetries = 0
    window.maxOfBatch = BATCH_SIZE
}

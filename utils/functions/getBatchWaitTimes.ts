import {
    BATCH_TRANSLATE_DELAY_TIME,
    BATCH_TRANSLATE_RETRY_INTERVAL
} from "~utils/constants"

export function getBatchWaitTime(
    targetLanguage: string,
    retries: number
): number {
    // take more time between intervals if it's not the current language
    const BATCH_INTERVAL =
        targetLanguage === window.polledSettings?.TARGET_LANGUAGE ||
        retries === 0
            ? BATCH_TRANSLATE_RETRY_INTERVAL
            : BATCH_TRANSLATE_RETRY_INTERVAL * 4

    return BATCH_INTERVAL
}

export function getMiniBatchWaitTime(
    targetLanguage: string,
    retries: number
): number {
    // take more time between intervals if it's not the current language

    const BATCH_MINI_INTERVAL =
        targetLanguage === window.polledSettings?.TARGET_LANGUAGE ||
        retries === 0
            ? BATCH_TRANSLATE_DELAY_TIME
            : BATCH_TRANSLATE_DELAY_TIME * 4

    return BATCH_MINI_INTERVAL
}

import type { UserSettings } from "~utils/localData"

export const BATCH_SIZE = 145
export const USER_SETTINGS_DEFAULTS: UserSettings = {
    TARGET_LANGUAGE: "en-US",
    API_KEY: "",
    ANKI_CONFIG: "BOTH",
    AUTO_TRANSLATE_WHILE_PLAYING: true
}
// every 1 minute
export const BATCH_TRANSLATE_RETRY_INTERVAL = 60000
// Stop translating after 10 retries
export const MAX_TRANSLATE_RETRIES = 10
export const MIN_UNTRANSLATED_SENTENCES = 10

import type { UserSettings } from "~utils/localData"

export const BATCH_SIZE = 175
export const USER_SETTINGS_DEFAULTS: UserSettings = {
    TARGET_LANGUAGE: "en-US",
    API_KEY: "",
    ANKI_CONFIG: "BOTH",
    AUTO_TRANSLATE_WHILE_PLAYING: true
}
// every 1 minute
export const BATCH_TRANSLATE_RETRY_INTERVAL = 60000

import type {
    BooleanKeys,
    BooleanUserSettings,
    UserSettings
} from "~utils/localData"

export const BATCH_SIZE = 80

export const BOOLEAN_USER_SETTINGS_DEFAULTS: BooleanUserSettings = {
    AUTO_TRANSLATE_WHILE_PLAYING: true,
    PAUSE_WHEN_TRANSLATING: true
}

export const USER_SETTINGS_DEFAULTS: UserSettings = {
    TARGET_LANGUAGE: "",
    API_KEY: "",
    AUTO_TRANSLATE_WHILE_PLAYING:
        BOOLEAN_USER_SETTINGS_DEFAULTS["AUTO_TRANSLATE_WHILE_PLAYING"],
    PAUSE_WHEN_TRANSLATING:
        BOOLEAN_USER_SETTINGS_DEFAULTS["PAUSE_WHEN_TRANSLATING"]
}

export const READABLE_BOOLEAN_SETTINGS: Record<
    BooleanKeys<UserSettings>,
    { title: string }
> = {
    AUTO_TRANSLATE_WHILE_PLAYING: {
        title: "Auto Translate While Watching"
    },
    PAUSE_WHEN_TRANSLATING: {
        title: "Pause Video When Clicking to Translate"
    }
}

export const POLLING_STATUS_INTERVAL = 2500
export const POLLING_TRANSLATIONS_CACHE_INTERVAL = 5000
// every x seconds
export const BATCH_TRANSLATE_RETRY_INTERVAL = 10000
// every x seconds
export const BATCH_TRANSLATE_DELAY_TIME = 2000
// Stop translating after x retries
export const MAX_TRANSLATE_RETRIES = 8

export const BREAK_TAG_RENAME = "NetflixToAnki_60981144762"

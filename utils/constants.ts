import type {
    BooleanKeys,
    BooleanUserSettings,
    UserSettings
} from "~utils/localData"

export const BATCH_SIZE = 145

export const BOOLEAN_USER_SETTINGS_DEFAULTS: BooleanUserSettings = {
    AUTO_TRANSLATE_WHILE_PLAYING: true,
    PAUSE_WHEN_TRANSLATING: true
}

export const USER_SETTINGS_DEFAULTS: UserSettings = {
    TARGET_LANGUAGE: "en-US",
    API_KEY: "",
    ANKI_CONFIG: "BOTH",
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
// every 30 seconds
export const BATCH_TRANSLATE_RETRY_INTERVAL = 30000
// every 1.5 seconds
export const BATCH_TRANSLATE_DELAY_TIME = 1500
// Stop translating after 6 retries
export const MAX_TRANSLATE_RETRIES = 6
export const MIN_UNTRANSLATED_SENTENCES = 10

import type {
    BooleanKeys,
    BooleanUserSettings,
    UserSettings
} from "~utils/localData"

export const BATCH_SIZE = 80

export const BOOLEAN_USER_SETTINGS_DEFAULTS: BooleanUserSettings = {}

export const USER_SETTINGS_DEFAULTS: UserSettings = {
    TARGET_LANGUAGE: "",
    API_KEY: "",
    TRANSLATE_WHEN: "on_pause",
    CUSTOM_TRANSLATE_KEY: ""
}

export const READABLE_BOOLEAN_SETTINGS: Record<
    BooleanKeys<UserSettings>,
    { title: string }
> = {}

export const READABLE_DROPDOWN_SETTINGS: Record<
    keyof Pick<UserSettings, "TRANSLATE_WHEN">,
    { title: string; options: Record<UserSettings["TRANSLATE_WHEN"], string> }
> = {
    TRANSLATE_WHEN: {
        title: "Translate When",
        options: {
            always: "video playing",
            on_pause: "video paused",
            custom_key: "custom key"
        }
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

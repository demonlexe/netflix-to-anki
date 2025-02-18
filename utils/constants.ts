import type {
    BooleanKeys,
    BooleanUserSettings,
    UserSettings
} from "~utils/localData"

export const BATCH_SIZE = 80

export const BOOLEAN_USER_SETTINGS_DEFAULTS: BooleanUserSettings = {
    HULU_ENABLED: true,
    NETFLIX_ENABLED: true,
    HBOMAX_ENABLED: true,
    TUBI_ENABLED: true
}

export const USER_SETTINGS_DEFAULTS: UserSettings = {
    TARGET_LANGUAGE: "",
    API_KEY: "",
    TRANSLATE_WHEN: "on_pause",
    CUSTOM_TRANSLATE_KEY: "",
    HULU_ENABLED: true,
    NETFLIX_ENABLED: true,
    HBOMAX_ENABLED: true,
    TUBI_ENABLED: true
}

export const READABLE_BOOLEAN_SETTINGS: Record<
    BooleanKeys<UserSettings>,
    { title: string }
> = {
    HULU_ENABLED: { title: "Hulu Enabled" },
    NETFLIX_ENABLED: { title: "Netflix Enabled" },
    HBOMAX_ENABLED: { title: "HBO Max Enabled" },
    TUBI_ENABLED: { title: "Tubi Enabled" }
}

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

export const SITE_WATCHERS = {
    netflix: {
        mountPoint: "#appMountPoint",
        captionElement: ".player-timedtext-text-container",
        captionParentElement: ".player-timedtext",
        lookFor: "span"
    },
    hulu: {
        mountPoint: "#__player__",
        captionElement: ".CaptionBox",
        captionParentElement: ".ClosedCaption__outband",
        lookFor: "p"
    },
    hbomax: {
        mountPoint: "#app-root",
        captionElement: `div > div:not(".eraxes") > div > div`,
        captionParentElement: `div[data-testid='caption_renderer_overlay']`,
        lookFor: "div"
    },
    tubi: {
        mountPoint: "#app",
        captionElement: `div[data-id="captionsComponent"]`,
        captionParentElement: `div[data-id="hls"]`,
        lookFor: "span"
    },
    unknown: {
        mountPoint: "",
        captionElement: "",
        captionParentElement: "",
        lookFor: ""
    }
}

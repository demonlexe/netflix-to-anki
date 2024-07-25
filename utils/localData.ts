/* eslint-disable no-console */
import { Storage } from "@plasmohq/storage"

import logDev from "./functions/logDev"

export type LocalData = {
    NATIVE_LANGUAGE: string
    NETFLIX_TO_ANKI_TRANSLATIONS_BY_ID: TranslationsCache
    NEED_TO_STUDY: Record<string, string>
    TRANSLATED_CURRENT: number
    TOTAL_SENTENCES: number
} & UserSettings

// {"243534233": {"french": {"lastUpdated": 1234234, "sentences": {"sentence": "translation"}}}}
export type TranslationsCache = Record<
    string, // show id
    TranslationsCacheShow
>

export type TranslationsCacheShow = Record<
    string, // language
    TranslationsCacheShowLanguage
>
export type TranslationsCacheShowLanguage = {
    sentences: Record<string, string>
    lastUpdated: number // os.time()
}

// {"243534233": {"french": {"lastUpdated": 1234234, "sentences": ["sentence1", "sentence2"]}}}
export type UntranslatedCache = Record<string, UntranslatedCacheShow>
export type UntranslatedCacheShow = Record<string, string[]>

export type UserSettings = {
    TARGET_LANGUAGE: string
    API_KEY: string
    AUTO_TRANSLATE_WHILE_PLAYING: boolean
    PAUSE_WHEN_TRANSLATING: boolean
}

export type BooleanKeys<T> = {
    [K in keyof T]: T[K] extends boolean ? K : never
}[keyof T]

export type BooleanUserSettings = Record<BooleanKeys<UserSettings>, boolean>

const storage = new Storage()
const localStorage = new Storage({
    area: "local"
})

export function getData<Key extends keyof LocalData, Value = LocalData[Key]>(
    key: Key,
    mode: "local" | "sync" = "local"
) {
    if (!key && key === null) {
        return null
    }

    const getDataPromise = new Promise(
        (resolve: (value: Value) => void, reject) => {
            try {
                if (mode && mode === "local") {
                    localStorage.get("" + key).then((result) => {
                        // logDev("Fetching data: returning ",result[key]);
                        const res = result
                        // logDev("Response is ", res)
                        resolve(res as Value)
                    })
                } else {
                    storage.get("" + key).then((result) => {
                        // logDev("Fetching data: returning ",result[key]);
                        const res = result
                        // logDev("Response is ", res)
                        resolve(res as Value)
                    })
                }
            } catch (err) {
                logDev("Error getting data: " + err)
                reject(false)
            }
        }
    )

    return getDataPromise
}
export function setData<Key extends keyof LocalData, Value = LocalData[Key]>(
    key: Key,
    value: Value,
    mode: "local" | "sync" = "local"
) {
    if ((!key && key === null) || (!value && value === null)) {
        return new Promise((resolve, reject) => {
            try {
                resolve(false)
            } catch {
                reject(false)
            }
        })
    }

    const setDataPromise = new Promise((resolve, reject) => {
        try {
            if (mode && mode === "local") {
                localStorage.set("" + key, value).then(function () {
                    // logDev(key,' is set succesfully to ',value);
                    resolve(true)
                })
            } else {
                storage.set("" + key, value).then(function () {
                    // logDev(key,' is set succesfully to ',value);
                    resolve(true)
                })
            }
        } catch (err) {
            logDev("Error setting data: " + err)
            reject(false)
        }
    })

    return setDataPromise
}

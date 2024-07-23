/* eslint-disable no-console */
import { Storage } from "@plasmohq/storage"

export type LocalData = {
    NATIVE_LANGUAGE: string
    NETFLIX_TO_ANKI_TRANSLATIONS_BY_ID: TranslationsCache
    NEED_TO_STUDY: Record<string, string>
} & UserSettings

// {243534233: {lastUpdated: 1234234, sentences: {"sentence": "translation"}}}
export type TranslationsCache = Record<
    string,
    {
        sentences: Record<string, string>
        lastUpdated: number // os.time()
    }
>

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
                        // console.log("Fetching data: returning ",result[key]);
                        const res = result
                        // console.log("Response is ", res)
                        resolve(res as Value)
                    })
                } else {
                    storage.get("" + key).then((result) => {
                        // console.log("Fetching data: returning ",result[key]);
                        const res = result
                        // console.log("Response is ", res)
                        resolve(res as Value)
                    })
                }
            } catch (err) {
                console.log("Error getting data: " + err)
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
                    // console.log(key,' is set succesfully to ',value);
                    resolve(true)
                })
            } else {
                storage.set("" + key, value).then(function () {
                    // console.log(key,' is set succesfully to ',value);
                    resolve(true)
                })
            }
        } catch (err) {
            console.log("Error setting data: " + err)
            reject(false)
        }
    })

    return setDataPromise
}

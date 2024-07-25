import { USER_SETTINGS_DEFAULTS } from "~utils/constants"
import { getData, setData } from "~utils/localData"

import logDev from "./logDev"

export default async function initData() {
    logDev("NTA: Initializing data")
    const [needToStudy] = await Promise.all([getData("NEED_TO_STUDY")])

    if (!needToStudy) {
        logDev("NTA: NEED_TO_STUDY is null, setting to default value")
        setData("NEED_TO_STUDY", {})
    }

    // loop all user defaults and set them if they don't exist
    for (const [key, value] of Object.entries(USER_SETTINGS_DEFAULTS)) {
        const data = await getData(key as keyof typeof USER_SETTINGS_DEFAULTS)
        if (data === undefined || data === null) {
            logDev(`NTA: ${key} is null, setting to default value`)
            setData(key as keyof typeof USER_SETTINGS_DEFAULTS, value)
        }
    }
}

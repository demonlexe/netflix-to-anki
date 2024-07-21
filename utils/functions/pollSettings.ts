import { USER_SETTINGS_DEFAULTS } from "~utils/constants"
import { getData, type UserSettings } from "~utils/localData"

// refetch settings every 8 seconds
export default async function pollSettings() {
    Object.keys(USER_SETTINGS_DEFAULTS).forEach(async (key) => {
        window.polledSettings[key] = await getData(key as keyof UserSettings)
    })
    setTimeout(pollSettings, 8000)
}

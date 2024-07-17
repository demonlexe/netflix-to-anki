import { getData, setData, type UserSettings } from "~localData"

export const UserSettingsDefaults: UserSettings = {
    TARGET_LANGUAGE: "en-US",
    API_KEY: "",
    ANKI_CONFIG: "BOTH"
}

export default async function initData() {
    console.log("NTA: Initializing data")
    const [needToStudy, ankiConfig] = await Promise.all([
        getData("NEED_TO_STUDY"),
        getData("ANKI_CONFIG")
    ])

    if (!needToStudy) {
        console.log("NTA: NEED_TO_STUDY is null, setting to default value")
        setData("NEED_TO_STUDY", {})
    }
    if (!ankiConfig) {
        console.log("NTA: ANKI_CONFIG is null, setting to default value")
        setData("ANKI_CONFIG", UserSettingsDefaults["ANKI_CONFIG"])
    }
}

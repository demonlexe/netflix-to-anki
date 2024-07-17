import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

enum API_KEY_STATUS {
    INVALID = "INVALID",
    VALID = "VALID",
    NOT_TESTED = "NOT_TESTED",
    SUCCESS = "SUCCESS"
}

const Settings = () => {
    const [apiKey, setApiKey] = useState("")
    const [language, setLanguage] = useState("")
    const [apiKeyStatus, setApiKeyStatus] = useState<API_KEY_STATUS>(
        API_KEY_STATUS.NOT_TESTED
    )
    const localStorage = new Storage({
        area: "local"
    })

    const updateLocalStorage = async (newKey: string, newLang: string) => {
        await localStorage.set("API_KEY", newKey)
        await localStorage.set("TARGET_LANGUAGE", newLang)
    }

    useEffect(() => {
        localStorage.get("API_KEY").then((apiKey) => setApiKey(apiKey))
        localStorage
            .get("TARGET_LANGUAGE")
            .then((lang) => setLanguage(lang ?? navigator.language))
        localStorage.set("NATIVE_LANGUAGE", navigator.language)
    }, [])

    return (
        <div>
            <label htmlFor="api-key-input">Gemini API Key</label>
            {apiKeyStatus === API_KEY_STATUS.INVALID && (
                <h4>INVALID - Check your API Key</h4>
            )}
            <input
                id="api-key-input"
                onChange={(e) => setApiKey(e.target.value)}
                value={apiKey}
            />
            <label htmlFor="target-lang-input">I'm Learning To Speak</label>
            <input
                id="target-lang-input"
                onChange={(e) => setLanguage(e.target.value)}
                value={language}
            />
            <button
                onClick={async () => {
                    const oldApiKey = await localStorage.get("API_KEY")
                    await updateLocalStorage(apiKey, language)
                    const testResult = await sendToBackground({
                        name: "test_gemini_key",
                        body: {}
                    })
                    if (testResult && !testResult.error) {
                        setApiKeyStatus(API_KEY_STATUS.SUCCESS)
                        setTimeout(() => {
                            setApiKeyStatus(API_KEY_STATUS.VALID)
                        }, 2000)
                    } else {
                        setApiKeyStatus(API_KEY_STATUS.INVALID)
                        await localStorage.set("API_KEY", oldApiKey)
                        setTimeout(() => {
                            setApiKeyStatus(API_KEY_STATUS.NOT_TESTED)
                        }, 2000)
                    }
                }}>
                {apiKeyStatus === API_KEY_STATUS.NOT_TESTED
                    ? "Apply"
                    : apiKeyStatus === API_KEY_STATUS.SUCCESS
                      ? "SUCCESS!"
                      : "Update"}
            </button>
        </div>
    )
}

export default Settings

import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import styles from "~styles/settings.module.css"
import { getData, setData } from "~utils/localData"

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

    const updateSettings = async () => {
        await Promise.all([
            setData("API_KEY", apiKey),
            setData("TARGET_LANGUAGE", language)
        ])
    }

    useEffect(() => {
        // Set Data
        setData("NATIVE_LANGUAGE", navigator.language)

        // Get Data
        getData("API_KEY").then((apiKey) => setApiKey(apiKey))
        getData("TARGET_LANGUAGE").then((lang) =>
            setLanguage(lang ?? navigator.language)
        )
    }, [])

    return (
        <div>
            <form
                style={{
                    display: "flex",
                    gap: "8px",
                    flexDirection: "column"
                }}>
                <div className={styles.flexRow}>
                    <label htmlFor="api-key-input">Gemini API Key</label>
                    {apiKeyStatus === API_KEY_STATUS.INVALID && (
                        <h4>INVALID - Check your API Key</h4>
                    )}
                    <input
                        id="api-key-input"
                        onChange={(e) => setApiKey(e.target.value)}
                        value={apiKey}
                        required
                    />
                </div>
                <div className={styles.flexRow}>
                    <label htmlFor="target-lang-input">
                        I'm Learning To Speak
                    </label>
                    <input
                        id="target-lang-input"
                        onChange={(e) => setLanguage(e.target.value)}
                        value={language}
                        required
                    />
                </div>
            </form>
            <button
                type="submit"
                style={{ width: "100%", color: "green", marginTop: "8px" }}
                onClick={async () => {
                    const testResult = await sendToBackground({
                        name: "test_gemini_key",
                        body: { key: apiKey }
                    })
                    if (testResult && !testResult.error) {
                        setApiKeyStatus(API_KEY_STATUS.SUCCESS)
                        await updateSettings()
                        setTimeout(() => {
                            setApiKeyStatus(API_KEY_STATUS.VALID)
                        }, 2000)
                    } else {
                        setApiKeyStatus(API_KEY_STATUS.INVALID)
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
            <h5>
                Don't have an API Key? Generate one at{" "}
                <a
                    href="https://ai.google.dev/gemini-api/docs/api-key"
                    target="_blank"
                    rel="noreferrer">
                    Gemini API
                </a>
            </h5>
        </div>
    )
}

export default Settings

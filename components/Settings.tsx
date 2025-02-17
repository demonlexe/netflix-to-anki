import { useCallback, useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import Required from "~components/Required"
import styles from "~styles/settings.module.css"
import logDev from "~utils/functions/logDev"
import { getData, setData } from "~utils/localData"

import SubmitButton from "./SubmitButton"

const Settings = () => {
    const [apiKey, setApiKey] = useState("")
    const [language, setLanguage] = useState("")

    useEffect(() => {
        // Set Data
        setData("NATIVE_LANGUAGE", navigator.language)

        // Get Data
        getData("API_KEY").then((apiKey) => setApiKey(apiKey ?? ""))
        getData("TARGET_LANGUAGE").then((lang) => setLanguage(lang ?? ""))
    }, [])

    const onSubmit = useCallback(async () => {
        if (!apiKey) {
            return "API Key is a required field."
        } else if (!language) {
            return "Target language is a required field."
        }
        await setData("TARGET_LANGUAGE", language)
        if ((await getData("TARGET_LANGUAGE")) !== language) {
            return "Couldn't update target language"
        }

        const testResult = await sendToBackground({
            name: "test_gemini_key",
            body: { key: apiKey }
        })

        logDev("Test result", testResult)
        if (testResult && !testResult.error) {
            await setData("API_KEY", apiKey)
            return null
        } else {
            return "Invalid API Key"
        }
    }, [apiKey, language])

    return (
        <div className={`${styles.flexCol} ${styles.gap16}`}>
            <form className={`${styles.flexCol} ${styles.gap16}`}>
                <div className={styles.flexRow}>
                    <label htmlFor="api-key-input">
                        Gemini API Key <Required />
                    </label>
                    <input
                        id="api-key-input"
                        onChange={(e) => setApiKey(e.target.value)}
                        value={apiKey}
                        required
                        placeholder="e.g. AIzaSyD8Qj4hu3nklkjn23..."
                    />
                </div>
                <div className={styles.flexRow}>
                    <label htmlFor="target-lang-input">
                        I'm Learning To Speak <Required />
                    </label>
                    <input
                        id="target-lang-input"
                        onChange={(e) => setLanguage(e.target.value)}
                        value={language}
                        required
                        placeholder="e.g. French"
                    />
                </div>
            </form>
            <div className={`${styles.w100} ${styles.flexCol} ${styles.gap4}`}>
                <SubmitButton onSubmit={onSubmit} />
                <p>
                    Don't have an API Key? Generate one at{" "}
                    <a
                        href="https://ai.google.dev/gemini-api/docs/api-key"
                        target="_blank"
                        rel="noreferrer">
                        Gemini API
                    </a>
                </p>
            </div>
        </div>
    )
}

export default Settings

import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import Required from "~components/Required"
import styles from "~styles/settings.module.css"
import { getData, setData } from "~utils/localData"

import SubmitButton from "./SubmitButton"

const Settings = () => {
    const [apiKey, setApiKey] = useState("")
    const [language, setLanguage] = useState("")

    useEffect(() => {
        // Set Data
        setData("NATIVE_LANGUAGE", navigator.language)

        // Get Data
        getData("API_KEY").then((apiKey) => setApiKey(apiKey))
        getData("TARGET_LANGUAGE").then((lang) => setLanguage(lang))
    }, [])

    return (
        <div>
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

                <div
                    className={`${styles.w100} ${styles.flexCol} ${styles.gap4}`}>
                    <SubmitButton
                        onSubmit={async () => {
                            if (!apiKey || !language) {
                                return false
                            }
                            await setData("TARGET_LANGUAGE", language)
                            if (
                                (await getData("TARGET_LANGUAGE")) !== language
                            ) {
                                return false
                            }
                            const testResult = await sendToBackground({
                                name: "test_gemini_key",
                                body: { key: apiKey }
                            })
                            if (testResult && !testResult.error) {
                                setData("API_KEY", apiKey)
                                return true
                            } else {
                                return false
                            }
                        }}
                    />
                    <h4>
                        Don't have an API Key? Generate one at{" "}
                        <a
                            href="https://ai.google.dev/gemini-api/docs/api-key"
                            target="_blank"
                            rel="noreferrer">
                            Gemini API
                        </a>
                    </h4>
                </div>
            </form>
        </div>
    )
}

export default Settings

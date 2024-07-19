import { useEffect, useState } from "react"

import {
    BOOLEAN_USER_SETTINGS_DEFAULTS,
    READABLE_BOOLEAN_SETTINGS
} from "~utils/constants"
import { getData, setData, type BooleanUserSettings } from "~utils/localData"

export default function BooleanSettings() {
    const [currentSettings, setCurrentSettings] = useState<BooleanUserSettings>(
        BOOLEAN_USER_SETTINGS_DEFAULTS
    )

    useEffect(() => {
        Promise.all(
            Object.keys(BOOLEAN_USER_SETTINGS_DEFAULTS).map(
                async (key: keyof BooleanUserSettings) => {
                    return getData(key)
                }
            )
        ).then((values) => {
            const newSettings = { ...currentSettings }
            values.forEach((value, index) => {
                newSettings[
                    Object.keys(BOOLEAN_USER_SETTINGS_DEFAULTS)[index]
                ] = value
            })
            setCurrentSettings(newSettings)
        })
    }, [])
    return (
        <div
            style={{
                display: "flex",
                gap: "8px",
                flexDirection: "column"
            }}>
            {Object.entries(READABLE_BOOLEAN_SETTINGS).map(
                ([key, { title }]) => (
                    <div key={key}>
                        <label htmlFor={key}>{title}</label>
                        <input
                            id={key}
                            type="checkbox"
                            checked={currentSettings[key]}
                            onChange={(e) => {
                                setCurrentSettings((oldSettings) => {
                                    return {
                                        ...oldSettings,
                                        [key]: e.target.checked
                                    }
                                })
                                setData(
                                    key as keyof typeof READABLE_BOOLEAN_SETTINGS,
                                    e.target.checked
                                )
                            }}
                        />
                    </div>
                )
            )}
        </div>
    )
}

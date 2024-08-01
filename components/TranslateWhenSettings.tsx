import { useEffect, useState } from "react"

import PressAnyKey from "~components/PressAnyKey"
import styles from "~styles/shared.module.css"
import { READABLE_DROPDOWN_SETTINGS } from "~utils/constants"
import { getData, setData, type UserSettings } from "~utils/localData"

export default function TranslateWhenSettings<T>() {
    const [currentSelected, setCurrentSelected] =
        useState<UserSettings["TRANSLATE_WHEN"]>("on_pause")
    const [customTranslateKey, setCustomTranslateKey] = useState<string>("")

    useEffect(() => {
        getData("TRANSLATE_WHEN").then((data) => {
            if (data) setCurrentSelected(data)
        })
        getData("CUSTOM_TRANSLATE_KEY").then((data) => {
            if (data) setCustomTranslateKey(data)
        })
    }, [])

    useEffect(() => {
        setData("TRANSLATE_WHEN", currentSelected)
    }, [currentSelected])

    useEffect(() => {
        setData("CUSTOM_TRANSLATE_KEY", customTranslateKey)
    }, [customTranslateKey])

    return (
        <div className={styles.flexCol}>
            <div className={styles.flexRow}>
                <div className={styles.flexRow}>
                    <label htmlFor="translateWhen">
                        {READABLE_DROPDOWN_SETTINGS.TRANSLATE_WHEN.title}
                    </label>
                    <select
                        id="translateWhen"
                        value={currentSelected}
                        onChange={(e) =>
                            setCurrentSelected(
                                e.target.value as UserSettings["TRANSLATE_WHEN"]
                            )
                        }>
                        {Object.entries(
                            READABLE_DROPDOWN_SETTINGS.TRANSLATE_WHEN.options
                        ).map(
                            ([key, value]: [
                                UserSettings["TRANSLATE_WHEN"],
                                string
                            ]) => (
                                <option key={key} value={key}>
                                    {value}
                                </option>
                            )
                        )}
                    </select>
                </div>
                {currentSelected === "custom_key" && (
                    <div>
                        <PressAnyKey
                            keyRecorded={customTranslateKey}
                            setKeyRecorded={setCustomTranslateKey}
                        />
                    </div>
                )}
            </div>
            <div>(Note: this setting automatically saves)</div>
        </div>
    )
}

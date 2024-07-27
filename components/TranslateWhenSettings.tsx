import { useEffect, useState } from "react"

import { READABLE_DROPDOWN_SETTINGS } from "~utils/constants"
import { getData, setData, type UserSettings } from "~utils/localData"

// TODO: IMPLEMENT CUSTOM KEY SELECTION

export default function TranslateWhenSettings<T>() {
    const [currentSelected, setCurrentSelected] =
        useState<UserSettings["TRANSLATE_WHEN"]>("on_pause")

    useEffect(() => {
        getData("TRANSLATE_WHEN").then((data) => {
            if (data) setCurrentSelected(data)
        })
    }, [])

    useEffect(() => {
        setData("TRANSLATE_WHEN", currentSelected)
    }, [currentSelected])

    return (
        <div>
            <div>
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
        </div>
    )
}

import { useEffect, useState } from "react"
import { Container, Form } from "react-bootstrap"

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
                async (key: keyof BooleanUserSettings) => getData(key)
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
        <Container>
            {Object.entries(READABLE_BOOLEAN_SETTINGS).map(
                ([key, { title }]: [
                    key: keyof typeof READABLE_BOOLEAN_SETTINGS,
                    { title: string }
                ]) => (
                    <Form.Group controlId={key} key={key} className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label={title}
                            checked={currentSettings[key]}
                            onChange={(e) => {
                                setCurrentSettings((oldSettings) => ({
                                    ...oldSettings,
                                    [key]: e.target.checked
                                }))
                                setData(
                                    key as keyof typeof READABLE_BOOLEAN_SETTINGS,
                                    e.target.checked
                                )
                            }}
                        />
                    </Form.Group>
                )
            )}
        </Container>
    )
}

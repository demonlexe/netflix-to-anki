import { useEffect, useState } from "react"
import { Col, Container, Form, Row } from "react-bootstrap"

import PressAnyKey from "~components/PressAnyKey"
import { READABLE_DROPDOWN_SETTINGS } from "~utils/constants"
import logDev from "~utils/functions/logDev"
import { getData, setData, type UserSettings } from "~utils/localData"

export default function TranslateWhenSettings<T>() {
    const [currentSelected, setCurrentSelected] =
        useState<UserSettings["TRANSLATE_WHEN"]>("on_pause")
    const [customTranslateKey, setCustomTranslateKey] = useState<string>("")
    logDev("Re-render: ", customTranslateKey)

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
        <Container>
            <Form.Group controlId="translateWhen" className="mb-3">
                <Row className="align-items-center">
                    <Col xs="auto">
                        <Form.Label className="mb-0">
                            {READABLE_DROPDOWN_SETTINGS.TRANSLATE_WHEN.title}
                        </Form.Label>
                    </Col>
                    <Col>
                        <Form.Select
                            value={currentSelected}
                            onChange={(e) =>
                                setCurrentSelected(
                                    e.target
                                        .value as UserSettings["TRANSLATE_WHEN"]
                                )
                            }>
                            {Object.entries(
                                READABLE_DROPDOWN_SETTINGS.TRANSLATE_WHEN
                                    .options
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
                        </Form.Select>
                    </Col>
                </Row>
            </Form.Group>
            {currentSelected === "custom_key" && (
                <Form.Group controlId="customTranslateKey" className="mb-3">
                    <PressAnyKey
                        keyRecorded={customTranslateKey}
                        setKeyRecorded={setCustomTranslateKey}
                    />
                </Form.Group>
            )}
        </Container>
    )
}

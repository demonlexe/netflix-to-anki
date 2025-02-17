import { useState } from "react"

import { Button } from "~node_modules/react-bootstrap/esm"

type PressAnyKeyProps = {
    keyRecorded: string
    setKeyRecorded: (key: string) => void
}
export default function PressAnyKey(props: PressAnyKeyProps) {
    const { keyRecorded, setKeyRecorded } = props
    const [capturing, setCapturing] = useState(false)

    const handleKeyDown = (event) => {
        if (capturing) {
            if (event.key === " ") return // do not allow space as a key
            setKeyRecorded(event.key)
            setCapturing(false)
        }
    }

    const startCapturing = () => {
        setCapturing(true)
    }

    return (
        <div onKeyDown={handleKeyDown} tabIndex={0} style={{ outline: "none" }}>
            <div>
                <Button onClick={startCapturing} variant="tertiary">
                    {capturing
                        ? "Click me, then press any key..."
                        : keyRecorded
                          ? `Captured Key: ${keyRecorded}`
                          : "Capture Key"}
                </Button>
            </div>
        </div>
    )
}

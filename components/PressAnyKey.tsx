import { useState } from "react"

type PressAnyKeyProps = {
    keyRecorded: string
    setKeyRecorded: (key: string) => void
}
export default function PressAnyKey(props: PressAnyKeyProps) {
    const { keyRecorded, setKeyRecorded } = props
    const [capturing, setCapturing] = useState(false)

    const handleKeyDown = (event) => {
        if (capturing) {
            if (event.key === " ") return // do nothing if pausing video, already handled lol
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
                <button onClick={startCapturing}>
                    {capturing
                        ? "Press any key..."
                        : keyRecorded
                          ? `Captured Key: ${keyRecorded}`
                          : "Capture Key"}
                </button>
            </div>
        </div>
    )
}

import { useEffect, useMemo, useState } from "react"

import { setData } from "~utils/localData"

enum ConfirmStatus {
    NOT_CLICKED = 0,
    NOT_CONFIRMED = 1,
    RESET = -1
}

export default function ResetAnkiDeck() {
    const [confirm, setConfirm] = useState(ConfirmStatus.NOT_CLICKED)
    return (
        <>
            <button
                onClick={() => {
                    if (
                        confirm === ConfirmStatus.NOT_CLICKED ||
                        confirm === ConfirmStatus.RESET
                    ) {
                        setConfirm(ConfirmStatus.NOT_CONFIRMED)
                        return
                    } else if (confirm === ConfirmStatus.NOT_CONFIRMED) {
                        setData("NEED_TO_STUDY", {}).then(() => {
                            setConfirm(ConfirmStatus.RESET)
                            // Reset the confirm status after 3 seconds
                            setTimeout(() => {
                                setConfirm((currentConfirm) =>
                                    currentConfirm === ConfirmStatus.RESET
                                        ? ConfirmStatus.NOT_CLICKED
                                        : currentConfirm
                                )
                            }, 3000)
                        })
                        return
                    }
                }}>
                Click me to RESET Anki Cache.
            </button>
            {confirm === ConfirmStatus.NOT_CONFIRMED && (
                <p style={{ color: "red" }}>
                    Are you sure you want to RESET? Click again if YES
                </p>
            )}
            {confirm === ConfirmStatus.RESET && (
                <p style={{ color: "green" }}>Anki Cache has been RESET!</p>
            )}
        </>
    )
}

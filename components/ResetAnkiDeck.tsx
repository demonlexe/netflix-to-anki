import { useState } from "react"

import { Button } from "~node_modules/react-bootstrap/esm"
import styles from "~styles/shared.module.css"
import { setData } from "~utils/localData"

enum ConfirmStatus {
    NOT_CLICKED = 0,
    NOT_CONFIRMED = 1,
    RESET = -1
}

type ResetAnkiDeckProps = {
    onReset: () => void
    disabled: boolean
    style: React.CSSProperties
}

export default function ResetAnkiDeck(props: ResetAnkiDeckProps) {
    const { onReset, disabled } = props
    const [confirm, setConfirm] = useState(ConfirmStatus.NOT_CLICKED)
    return (
        <div className={styles.flexCol} style={props.style}>
            <Button
                disabled={disabled}
                variant="outline-danger"
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
                            onReset()
                        })
                        return
                    }
                }}>
                RESET Anki Deck.
            </Button>
            {confirm === ConfirmStatus.NOT_CONFIRMED && (
                <p style={{ color: "red" }}>
                    Are you sure you want to RESET? Click again if YES
                </p>
            )}
            {confirm === ConfirmStatus.RESET && (
                <p style={{ color: "green" }}>Anki Cache has been RESET!</p>
            )}
        </div>
    )
}

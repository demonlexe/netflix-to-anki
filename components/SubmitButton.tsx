import { useState } from "react"

import { Button } from "~node_modules/react-bootstrap/esm"
import styles from "~styles/shared.module.css"

type SubmitButtonProps = {
    onSubmit: () => Promise<string>
}

enum SubmitButtonStatus {
    INITIAL = "Apply",
    SUCCESS = "SUCCESS!",
    UPDATE = "Update",
    LOADING = "Loading...",
    FAILED = "FAILED"
}

export default function SubmitButton(props: SubmitButtonProps) {
    const { onSubmit } = props
    const [status, setStatus] = useState<SubmitButtonStatus>(
        SubmitButtonStatus.INITIAL
    )
    const [error, setError] = useState<string | null>(null)

    return (
        <Button
            onClick={async () => {
                setStatus(SubmitButtonStatus.LOADING)
                const err = await onSubmit()
                if (!err) {
                    setStatus(SubmitButtonStatus.SUCCESS)
                    setTimeout(() => {
                        setStatus(SubmitButtonStatus.UPDATE)
                    }, 2000)
                } else {
                    setError(err)
                    setStatus(SubmitButtonStatus.FAILED)
                    setTimeout(() => {
                        setStatus((prevStatus) => {
                            if (prevStatus === SubmitButtonStatus.FAILED) {
                                return SubmitButtonStatus.INITIAL
                            }
                            return prevStatus
                        })
                        setError((prevErr) => {
                            if (prevErr === err) {
                                return null
                            }
                            return prevErr
                        })
                    }, 10000)
                }
            }}>
            {status === SubmitButtonStatus.FAILED ? (
                <span
                    style={{
                        color: "red"
                    }}>
                    {status}: {error}
                </span>
            ) : (
                <span>{status}</span>
            )}
        </Button>
    )
}

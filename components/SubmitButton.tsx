import { useState } from "react"

import styles from "~styles/shared.module.css"

type SubmitButtonProps = {
    onSubmit: () => Promise<boolean>
}

enum SubmitButtonStatus {
    INITIAL = "Apply",
    SUCCESS = "SUCCESS!",
    FAILED = "FAILED",
    UPDATE = "Update",
    LOADING = "Loading..."
}

export default function SubmitButton(props: SubmitButtonProps) {
    const { onSubmit } = props
    const [status, setStatus] = useState<SubmitButtonStatus>(
        SubmitButtonStatus.INITIAL
    )

    return (
        <button
            type="submit"
            onClick={async () => {
                setStatus(SubmitButtonStatus.LOADING)
                if (await onSubmit()) {
                    setStatus(SubmitButtonStatus.SUCCESS)
                    setTimeout(() => {
                        setStatus(SubmitButtonStatus.UPDATE)
                    }, 2000)
                } else {
                    setStatus(SubmitButtonStatus.FAILED)
                    setTimeout(() => {
                        setStatus(SubmitButtonStatus.INITIAL)
                    }, 2000)
                }
            }}>
            <span
                style={{
                    color:
                        status === SubmitButtonStatus.FAILED ? "red" : "green"
                }}>
                {status}
            </span>
        </button>
    )
}

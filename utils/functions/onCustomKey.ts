import onClick from "~utils/handlers/onClick"

let watchingCustomKey = false

export default function onCustomKey() {
    if (watchingCustomKey) return
    watchingCustomKey = true

    document.addEventListener("keydown", async (e) => {
        if (window.polledSettings.TRANSLATE_WHEN !== "custom_key") return
        if (window.polledSettings.CUSTOM_TRANSLATE_KEY !== e.key) return

        onClick()
    })
}

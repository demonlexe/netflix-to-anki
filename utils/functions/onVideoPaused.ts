import onClick from "~utils/handlers/onClick"

export default function onVideoPaused(videoElement: JQuery<HTMLVideoElement>) {
    videoElement.on("pause", () => {
        if (
            window.polledSettings.TRANSLATE_WHEN !== "on_pause" &&
            window.polledSettings.TRANSLATE_WHEN !== "always"
        ) {
            return
        }
        onClick()
    })
}

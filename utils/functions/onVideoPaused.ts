import onClick from "~utils/handlers/onClick"

export default function onVideoPaused(videoElement: JQuery<HTMLVideoElement>) {
    videoElement.on("pause", () => {
        onClick()
    })
}

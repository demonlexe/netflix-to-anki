import $ from "jquery"

export default function getLiveElement(
    currentText: string = "",
    textContainer?: JQuery<HTMLElement>
) {
    return (textContainer ?? $(`.player-timedtext-text-container`))
        .find(`span:contains("${currentText}")`)
        .first()
}

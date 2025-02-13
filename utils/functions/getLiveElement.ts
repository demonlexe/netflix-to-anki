import $ from "jquery"

import { SITE_WATCHERS } from "~utils/constants"

export default function getLiveElement(
    currentText: string = "",
    textContainer?: JQuery<HTMLElement>
) {
    const { captionElement, lookFor } = SITE_WATCHERS[window.usingSite]
    const using = (textContainer ?? $(captionElement)).find(lookFor)
    let firstMatch = null
    using.each((_, el) => {
        if ($(el).html().trim().match(currentText)) {
            firstMatch = $(el)
            return false
        }
    })
    return firstMatch
}

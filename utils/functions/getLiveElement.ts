import $ from "jquery"

import { SITE_WATCHERS } from "~utils/constants"

export default function getLiveElement(
    currentText: string = "",
    textContainer?: JQuery<HTMLElement>
) {
    const { captionElement, lookFor } = SITE_WATCHERS[window.usingSite]
    return (textContainer ?? $(captionElement))
        .find(`${lookFor}:contains("${currentText}")`)
        .first()
}
